import Constants from 'expo-constants';
import { ConvexReactClient } from 'convex/react';

const convexUrl =
  process.env.EXPO_PUBLIC_CONVEX_URL ??
  (Constants.expoConfig?.extra?.convexUrl as string | undefined);

if (!convexUrl) {
  throw new Error('Missing Convex URL. Set EXPO_PUBLIC_CONVEX_URL or app.json extra.convexUrl.');
}

export const convex = new ConvexReactClient(convexUrl);
