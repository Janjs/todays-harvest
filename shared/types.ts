export type Category = 'fruit' | 'vegetable';

export type SeasonalRequest = {
  countryCode: string;
  region?: string | null;
  month: number;
  category: Category;
  forceRegenerate?: boolean;
};

export type SeasonalItem = {
  name: string;
  emoji: string;
  confidence: number;
};

export type SeasonalResponse = {
  countryCode: string;
  region: string | null;
  month: number;
  category: Category;
  items: SeasonalItem[];
  source: 'llm' | 'manual';
  cacheKey: string;
  cacheStatus: 'hit' | 'miss';
  updatedAt: number;
};

export type WidgetPayload = {
  title: string;
  emojis: string[];
  locationLabel: string;
  monthLabel: string;
  updatedAt: number;
};
