import { Category } from '../../shared/types';

export function buildCacheKey(input: {
  countryCode: string;
  region?: string | null;
  month: number;
  category: Category;
}): string {
  const region = input.region?.trim() || '_';
  return `${input.countryCode.toUpperCase()}:${region}:${input.month}:${input.category}`;
}
