import { mutation, query } from './_generated/server';

const DEFAULT_PRODUCE = [
  { canonicalName: 'apple', emoji: '🍎', category: 'fruit', aliases: ['apples'] },
  { canonicalName: 'pear', emoji: '🍐', category: 'fruit', aliases: ['pears'] },
  { canonicalName: 'orange', emoji: '🍊', category: 'fruit', aliases: ['oranges'] },
  { canonicalName: 'lemon', emoji: '🍋', category: 'fruit', aliases: ['lemons'] },
  { canonicalName: 'banana', emoji: '🍌', category: 'fruit', aliases: ['bananas'] },
  { canonicalName: 'watermelon', emoji: '🍉', category: 'fruit', aliases: ['watermelons'] },
  { canonicalName: 'grape', emoji: '🍇', category: 'fruit', aliases: ['grapes'] },
  { canonicalName: 'strawberry', emoji: '🍓', category: 'fruit', aliases: ['strawberries'] },
  { canonicalName: 'melon', emoji: '🍈', category: 'fruit', aliases: ['melons', 'cantaloupe'] },
  { canonicalName: 'cherry', emoji: '🍒', category: 'fruit', aliases: ['cherries'] },
  { canonicalName: 'blueberry', emoji: '🫐', category: 'fruit', aliases: ['blueberries'] },
  { canonicalName: 'peach', emoji: '🍑', category: 'fruit', aliases: ['peaches'] },
  { canonicalName: 'mango', emoji: '🥭', category: 'fruit', aliases: ['mangoes'] },
  { canonicalName: 'pineapple', emoji: '🍍', category: 'fruit', aliases: ['pineapples'] },
  { canonicalName: 'kiwi', emoji: '🥝', category: 'fruit', aliases: ['kiwifruit'] },
  { canonicalName: 'tomato', emoji: '🍅', category: 'vegetable', aliases: ['tomatoes'] },
  { canonicalName: 'eggplant', emoji: '🍆', category: 'vegetable', aliases: ['aubergine'] },
  { canonicalName: 'avocado', emoji: '🥑', category: 'vegetable', aliases: ['avocados'] },
  { canonicalName: 'broccoli', emoji: '🥦', category: 'vegetable', aliases: [] },
  { canonicalName: 'cucumber', emoji: '🥒', category: 'vegetable', aliases: ['cucumbers'] },
  { canonicalName: 'leafy greens', emoji: '🥬', category: 'vegetable', aliases: ['lettuce', 'greens'] },
  { canonicalName: 'bell pepper', emoji: '🫑', category: 'vegetable', aliases: ['peppers'] },
  { canonicalName: 'carrot', emoji: '🥕', category: 'vegetable', aliases: ['carrots'] },
  { canonicalName: 'corn', emoji: '🌽', category: 'vegetable', aliases: [] },
  { canonicalName: 'olive', emoji: '🫒', category: 'vegetable', aliases: ['olives'] },
  { canonicalName: 'garlic', emoji: '🧄', category: 'vegetable', aliases: [] },
  { canonicalName: 'onion', emoji: '🧅', category: 'vegetable', aliases: ['onions'] },
  { canonicalName: 'mushroom', emoji: '🍄', category: 'vegetable', aliases: ['mushrooms'] },
  { canonicalName: 'potato', emoji: '🥔', category: 'vegetable', aliases: ['potatoes'] },
  { canonicalName: 'sweet potato', emoji: '🍠', category: 'vegetable', aliases: ['sweet potatoes'] },
  { canonicalName: 'chestnut', emoji: '🌰', category: 'vegetable', aliases: ['chestnuts'] }
] as const;

export const listCatalog = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('produce_catalog').collect();
  }
});

export const seedCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    let updated = 0;

    for (const item of DEFAULT_PRODUCE) {
      const existing = await ctx.db
        .query('produce_catalog')
        .withIndex('by_canonical_name', (q) => q.eq('canonicalName', item.canonicalName))
        .first();

      if (!existing) {
        await ctx.db.insert('produce_catalog', {
          canonicalName: item.canonicalName,
          emoji: item.emoji,
          category: item.category,
          aliases: [...item.aliases],
          enabled: true
        });
        inserted += 1;
        continue;
      }

      const shouldPatch =
        existing.emoji !== item.emoji ||
        existing.category !== item.category ||
        JSON.stringify(existing.aliases) !== JSON.stringify(item.aliases);

      if (shouldPatch) {
        await ctx.db.patch(existing._id, {
          emoji: item.emoji,
          category: item.category,
          aliases: [...item.aliases]
        });
        updated += 1;
      }
    }

    return { inserted, updated, skipped: inserted === 0 && updated === 0 };
  }
});
