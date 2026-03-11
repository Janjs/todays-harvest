import type { Category } from '../shared/types';

export const PROMPT_VERSION = 'v1';

export function normalizeCountryCode(countryCode: string): string {
  return countryCode.trim().toUpperCase();
}

export function normalizeRegion(region?: string | null): string | undefined {
  if (!region) {
    return undefined;
  }
  const cleaned = region.trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

export function buildCacheKey(input: {
  countryCode: string;
  region?: string | null;
  month: number;
  category: Category;
}): string {
  const countryCode = normalizeCountryCode(input.countryCode);
  const region = normalizeRegion(input.region) ?? '_';
  return `${countryCode}:${region}:${input.month}:${input.category}`;
}

export function monthLabel(month: number): string {
  return new Date(Date.UTC(2025, month - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC'
  });
}
