import { Category } from './types';

const WIDGET_FALLBACK_BY_CATEGORY: Record<Category, string> = {
  fruit: '🍎',
  vegetable: '🍅'
};

export function normalizeWidgetEmoji(emoji: string, category: Category): string {
  const trimmed = emoji.trim();
  if (!trimmed) {
    return WIDGET_FALLBACK_BY_CATEGORY[category];
  }
  return trimmed;
}

export function normalizeWidgetEmojiUnknown(emoji: string): string {
  const trimmed = emoji.trim();
  if (!trimmed) {
    return '🍎';
  }
  return trimmed;
}
