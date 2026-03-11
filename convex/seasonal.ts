import OpenAI from 'openai';
import { z } from 'zod';
import { v } from 'convex/values';
import { action, mutation, query } from './_generated/server';
import { api } from './_generated/api';
import type { SeasonalItem, SeasonalRequest, SeasonalResponse, WidgetPayload } from '../shared/types';
import { buildCacheKey, monthLabel, normalizeCountryCode, normalizeRegion, PROMPT_VERSION } from './utils';

const MIN_CONFIDENCE = 0.6;
const MIN_ITEMS = 4;
const MAX_ITEMS = 8;

const llmResponseSchema = z.object({
  countryCode: z.string(),
  region: z.string().nullable().optional(),
  month: z.number().int(),
  category: z.union([z.literal('fruit'), z.literal('vegetable')]),
  items: z.array(
    z.object({
      name: z.string(),
      emoji: z.string(),
      confidence: z.number()
    })
  )
});

function validateMonth(month: number): void {
  if (month < 1 || month > 12) {
    throw new Error('month must be 1..12');
  }
}

function isCorruptEmojiValue(emoji: string): boolean {
  const value = emoji.trim();
  if (!value) {
    return true;
  }
  return value.includes('?') || value.includes('\uFFFD');
}

function normalizeRequest(input: SeasonalRequest): Required<Omit<SeasonalRequest, 'forceRegenerate'>> {
  validateMonth(input.month);
  return {
    countryCode: normalizeCountryCode(input.countryCode),
    region: normalizeRegion(input.region) ?? null,
    month: input.month,
    category: input.category
  };
}

function makePrompt(input: Required<Omit<SeasonalRequest, 'forceRegenerate'>>): string {
  return [
    'Return strict JSON only. No prose, no markdown.',
    'Task: List produce commonly considered in season for local consumers.',
    `countryCode: ${input.countryCode}`,
    `region: ${input.region ?? 'null'}`,
    `month: ${input.month}`,
    `category: ${input.category}`,
    'Prefer common supermarket produce and avoid rare/niche items.',
    'Return this exact object shape:',
    '{"countryCode":"XX","region":null,"month":1,"category":"fruit","items":[{"name":"apple","emoji":"🍎","confidence":0.91}]}'
  ].join('\n');
}

export const getEnabledCatalog = query({
  args: {
    category: v.union(v.literal('fruit'), v.literal('vegetable'))
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('produce_catalog')
      .withIndex('by_category_enabled', (q) => q.eq('category', args.category).eq('enabled', true))
      .collect();
  }
});

export const getCachedSeasonal = query({
  args: {
    countryCode: v.string(),
    region: v.optional(v.string()),
    month: v.number(),
    category: v.union(v.literal('fruit'), v.literal('vegetable'))
  },
  handler: async (ctx, args) => {
    validateMonth(args.month);
    const key = buildCacheKey(args);
    const cached = await ctx.db
      .query('seasonal_items_cache')
      .withIndex('by_key', (q) => q.eq('key', key))
      .first();

    if (!cached) {
      return null;
    }

    return {
      countryCode: cached.countryCode,
      region: cached.region ?? null,
      month: cached.month,
      category: cached.category,
      items: cached.items,
      source: cached.source,
      cacheKey: cached.key,
      cacheStatus: 'hit' as const,
      updatedAt: cached.updatedAt
    };
  }
});

export const upsertSeasonalCache = mutation({
  args: {
    key: v.string(),
    countryCode: v.string(),
    region: v.optional(v.string()),
    month: v.number(),
    category: v.union(v.literal('fruit'), v.literal('vegetable')),
    items: v.array(
      v.object({
        name: v.string(),
        emoji: v.string(),
        confidence: v.number()
      })
    ),
    source: v.union(v.literal('llm'), v.literal('manual')),
    promptVersion: v.string()
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('seasonal_items_cache')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        countryCode: args.countryCode,
        region: args.region,
        month: args.month,
        category: args.category,
        items: args.items,
        source: args.source,
        updatedAt: now,
        promptVersion: args.promptVersion
      });
      return { updated: true, createdAt: existing.createdAt, updatedAt: now };
    }

    await ctx.db.insert('seasonal_items_cache', {
      key: args.key,
      countryCode: args.countryCode,
      region: args.region,
      month: args.month,
      category: args.category,
      items: args.items,
      source: args.source,
      createdAt: now,
      updatedAt: now,
      promptVersion: args.promptVersion
    });

    return { updated: false, createdAt: now, updatedAt: now };
  }
});

export const logGeneration = mutation({
  args: {
    request: v.object({
      countryCode: v.string(),
      region: v.optional(v.string()),
      month: v.number(),
      category: v.union(v.literal('fruit'), v.literal('vegetable'))
    }),
    rawResponse: v.string(),
    validationResult: v.object({
      accepted: v.number(),
      rejected: v.number(),
      reasons: v.array(v.string())
    })
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('generation_logs', {
      ...args,
      createdAt: Date.now()
    });
  }
});

export const setManualOverride = mutation({
  args: {
    countryCode: v.string(),
    region: v.optional(v.string()),
    month: v.number(),
    category: v.union(v.literal('fruit'), v.literal('vegetable')),
    items: v.array(
      v.object({
        name: v.string(),
        emoji: v.string(),
        confidence: v.number()
      })
    )
  },
  handler: async (ctx, args) => {
    validateMonth(args.month);
    const normalized = normalizeRequest(args);
    const key = buildCacheKey(normalized);
    const now = Date.now();
    const existing = await ctx.db
      .query('seasonal_items_cache')
      .withIndex('by_key', (q) => q.eq('key', key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        items: args.items.slice(0, MAX_ITEMS),
        source: 'manual',
        updatedAt: now,
        promptVersion: PROMPT_VERSION
      });
      return { updated: true, updatedAt: now };
    }

    await ctx.db.insert('seasonal_items_cache', {
      key,
      countryCode: normalized.countryCode,
      region: normalized.region ?? undefined,
      month: normalized.month,
      category: normalized.category,
      items: args.items.slice(0, MAX_ITEMS),
      source: 'manual',
      createdAt: now,
      updatedAt: now,
      promptVersion: PROMPT_VERSION
    });

    return { updated: false, updatedAt: now };
  }
});

function normalizeItems(params: {
  request: Required<Omit<SeasonalRequest, 'forceRegenerate'>>;
  llmItems: SeasonalItem[];
  catalog: Array<{
    canonicalName: string;
    emoji: string;
    aliases: string[];
  }>;
}): { items: SeasonalItem[]; rejectedReasons: string[] } {
  const rejectedReasons: string[] = [];

  const byName = new Map<string, { canonicalName: string; emoji: string }>();
  for (const item of params.catalog) {
    byName.set(item.canonicalName.toLowerCase(), {
      canonicalName: item.canonicalName,
      emoji: item.emoji
    });
    for (const alias of item.aliases) {
      byName.set(alias.toLowerCase(), {
        canonicalName: item.canonicalName,
        emoji: item.emoji
      });
    }
  }

  const deduped = new Map<string, SeasonalItem>();

  for (const item of params.llmItems) {
    if (item.confidence < MIN_CONFIDENCE) {
      rejectedReasons.push(`dropped_low_confidence:${item.name}`);
      continue;
    }

    const mapped = byName.get(item.name.trim().toLowerCase());
    if (!mapped) {
      rejectedReasons.push(`missing_catalog_name:${item.name}`);
      continue;
    }

    if (item.emoji !== mapped.emoji) {
      rejectedReasons.push(`normalized_emoji:${item.name}`);
    }

    if (!deduped.has(mapped.canonicalName)) {
      deduped.set(mapped.canonicalName, {
        name: mapped.canonicalName,
        emoji: mapped.emoji,
        confidence: item.confidence
      });
    }
  }

  const items = Array.from(deduped.values()).slice(0, MAX_ITEMS);

  if (items.length < MIN_ITEMS) {
    for (const catalogItem of params.catalog) {
      if (items.length >= MIN_ITEMS) {
        break;
      }
      if (items.some((i) => i.name === catalogItem.canonicalName)) {
        continue;
      }
      items.push({
        name: catalogItem.canonicalName,
        emoji: catalogItem.emoji,
        confidence: MIN_CONFIDENCE
      });
      rejectedReasons.push(`padded_with_catalog:${catalogItem.canonicalName}`);
    }
  }

  return { items: items.slice(0, MAX_ITEMS), rejectedReasons };
}

async function generateWithOpenAI(params: {
  request: Required<Omit<SeasonalRequest, 'forceRegenerate'>>;
  catalog: Array<{
    canonicalName: string;
    emoji: string;
    aliases: string[];
  }>;
}): Promise<{
  normalizedItems: SeasonalItem[];
  rawResponse: string;
  rejectedReasons: string[];
}> {
  const apiKey = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env?.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured in Convex environment');
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: makePrompt(params.request) }]
  });

  const content = completion.choices[0]?.message?.content ?? '{}';
  const parsed = llmResponseSchema.parse(JSON.parse(content));

  if (normalizeCountryCode(parsed.countryCode) !== params.request.countryCode) {
    throw new Error('LLM countryCode did not match request');
  }
  if (parsed.month !== params.request.month) {
    throw new Error('LLM month did not match request');
  }
  if (parsed.category !== params.request.category) {
    throw new Error('LLM category did not match request');
  }

  const normalized = normalizeItems({
    request: params.request,
    llmItems: parsed.items,
    catalog: params.catalog
  });

  return {
    normalizedItems: normalized.items,
    rawResponse: content,
    rejectedReasons: normalized.rejectedReasons
  };
}

export const getSeasonalItems = action({
  args: {
    countryCode: v.string(),
    region: v.optional(v.string()),
    month: v.number(),
    category: v.union(v.literal('fruit'), v.literal('vegetable')),
    forceRegenerate: v.optional(v.boolean())
  },
  handler: async (ctx, args): Promise<SeasonalResponse> => {
    const normalized = normalizeRequest(args);
    const cacheKey = buildCacheKey(normalized);

    if (!args.forceRegenerate) {
      const cached = await ctx.runQuery(api.seasonal.getCachedSeasonal, {
        ...normalized,
        region: normalized.region ?? undefined
      });

      const hasCorruptEmoji = cached?.items.some((item) => isCorruptEmojiValue(item.emoji)) ?? false;
      if (cached && !hasCorruptEmoji) {
        return cached;
      }
    }

    const catalog = await ctx.runQuery(api.seasonal.getEnabledCatalog, {
      category: normalized.category
    });

    const { normalizedItems, rawResponse, rejectedReasons } = await generateWithOpenAI({
      request: normalized,
      catalog: catalog.map((item) => ({
        canonicalName: item.canonicalName,
        emoji: item.emoji,
        aliases: item.aliases
      }))
    });

    const upsert = await ctx.runMutation(api.seasonal.upsertSeasonalCache, {
      key: cacheKey,
      countryCode: normalized.countryCode,
      region: normalized.region ?? undefined,
      month: normalized.month,
      category: normalized.category,
      items: normalizedItems,
      source: 'llm',
      promptVersion: PROMPT_VERSION
    });

    await ctx.runMutation(api.seasonal.logGeneration, {
      request: {
        countryCode: normalized.countryCode,
        region: normalized.region ?? undefined,
        month: normalized.month,
        category: normalized.category
      },
      rawResponse,
      validationResult: {
        accepted: normalizedItems.length,
        rejected: rejectedReasons.length,
        reasons: rejectedReasons
      }
    });

    return {
      countryCode: normalized.countryCode,
      region: normalized.region,
      month: normalized.month,
      category: normalized.category,
      items: normalizedItems,
      source: 'llm',
      cacheKey,
      cacheStatus: 'miss',
      updatedAt: upsert.updatedAt
    };
  }
});

export const getWidgetPayload = query({
  args: {
    countryCode: v.string(),
    region: v.optional(v.string()),
    month: v.number(),
    category: v.union(v.literal('fruit'), v.literal('vegetable'))
  },
  handler: async (ctx, args): Promise<WidgetPayload | null> => {
    validateMonth(args.month);
    const key = buildCacheKey(args);
    const cached = await ctx.db
      .query('seasonal_items_cache')
      .withIndex('by_key', (q) => q.eq('key', key))
      .first();

    if (!cached) {
      return null;
    }

    return {
      title: "Today's Harvest",
      emojis: cached.items.slice(0, 6).map((item) => item.emoji),
      locationLabel: [cached.region, cached.countryCode].filter(Boolean).join(' • '),
      monthLabel: monthLabel(cached.month),
      updatedAt: cached.updatedAt
    };
  }
});

export const prefillSeasonalFruit = action({
  args: {},
  handler: async (ctx) => {
    const month = new Date().getUTCMonth() + 1;
    const countries = ['US', 'NL', 'GB', 'DE', 'FR', 'ES', 'IT', 'JP', 'AU', 'BR'];

    for (const countryCode of countries) {
      await ctx.runAction(api.seasonal.getSeasonalItems, {
        countryCode,
        month,
        category: 'fruit'
      });
    }

    return { ok: true, countries: countries.length, month };
  }
});
