import { Category } from './types';

// Emojis with guaranteed image assets in the native widget extension.
export const WIDGET_RENDERABLE_EMOJIS = ['🍎', '🍐', '🍊', '🍋', '🥕', '🍅', '🍆', '🥑'] as const;

const WIDGET_EMOJI_CANONICAL_MAP: Record<string, string> = {
  // Fruit
  '🍎': '🍎',
  '🍐': '🍐',
  '🍊': '🍊',
  '🍋': '🍋',
  '🍌': '🍐',
  '🍉': '🍊',
  '🍇': '🍎',
  '🍓': '🍅',
  '🍈': '🍐',
  '🍒': '🍅',
  '🫐': '🍎',
  '🍑': '🍎',
  '🥭': '🍊',
  '🍍': '🍐',
  '🥝': '🍐',

  // Vegetables
  '🍅': '🍅',
  '🍆': '🍆',
  '🥑': '🥑',
  '🥦': '🥕',
  '🥒': '🥕',
  '🥬': '🥕',
  '🫑': '🥕',
  '🥕': '🥕',
  '🌽': '🥕',
  '🫒': '🥑',
  '🧄': '🥕',
  '🧅': '🥕',
  '🍄': '🍆',
  '🥔': '🥕',
  '🍠': '🥕',
  '🌰': '🥑'
};

const WIDGET_FALLBACK_BY_CATEGORY: Record<Category, string> = {
  fruit: '🍎',
  vegetable: '🥕'
};

const WIDGET_RENDERABLE_SET = new Set<string>(WIDGET_RENDERABLE_EMOJIS);

export function normalizeWidgetEmoji(emoji: string, category: Category): string {
  const trimmed = emoji.trim();
  if (!trimmed) {
    return WIDGET_FALLBACK_BY_CATEGORY[category];
  }

  const mapped = WIDGET_EMOJI_CANONICAL_MAP[trimmed] ?? trimmed;
  if (WIDGET_RENDERABLE_SET.has(mapped)) {
    return mapped;
  }

  return WIDGET_FALLBACK_BY_CATEGORY[category];
}

export function normalizeWidgetEmojiUnknown(emoji: string): string {
  const trimmed = emoji.trim();
  if (!trimmed) {
    return '🥕';
  }

  const mapped = WIDGET_EMOJI_CANONICAL_MAP[trimmed] ?? trimmed;
  if (WIDGET_RENDERABLE_SET.has(mapped)) {
    return mapped;
  }

  return '🥕';
}
