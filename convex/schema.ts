import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  seasonal_items_cache: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
    promptVersion: v.string()
  })
    .index('by_key', ['key'])
    .index('by_country_region_month_category', ['countryCode', 'region', 'month', 'category']),

  produce_catalog: defineTable({
    canonicalName: v.string(),
    emoji: v.string(),
    category: v.union(v.literal('fruit'), v.literal('vegetable')),
    aliases: v.array(v.string()),
    enabled: v.boolean()
  })
    .index('by_canonical_name', ['canonicalName'])
    .index('by_category_enabled', ['category', 'enabled']),

  generation_logs: defineTable({
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
    }),
    createdAt: v.number()
  }).index('by_created_at', ['createdAt'])
});
