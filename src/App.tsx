import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ConvexProvider, useAction, useMutation } from 'convex/react';
import * as Location from 'expo-location';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../convex/_generated/api';
import { SeasonalResponse } from '../shared/types';
import { convex } from './lib/convex';
import { currentMonthInDeviceTimezone, monthLabel } from './lib/date';
import { requestAndResolveLocation, ResolvedLocation } from './lib/location';
import { writeWidgetPayload } from './lib/widget';
import { HomeScreen } from './screens/HomeScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';

function HarvestApp() {
  const [permission, setPermission] = useState<Location.PermissionStatus | 'undetermined'>('undetermined');
  const [isBooting, setIsBooting] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [draftLocation, setDraftLocation] = useState<ResolvedLocation>({
    countryCode: '',
    region: null,
    city: null
  });
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [data, setData] = useState<SeasonalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const month = useMemo(() => currentMonthInDeviceTimezone(), []);

  const seedCatalog = useMutation(api.catalog.seedCatalog);
  const getSeasonalItems = useAction(api.seasonal.getSeasonalItems);

  const refreshSeasonal = useCallback(
    async (targetLocation: ResolvedLocation, forceRegenerate = false) => {
      if (!targetLocation.countryCode) {
        return null;
      }

      setIsLoadingLocation(true);
      setError(null);

      try {
        const response = await getSeasonalItems({
          countryCode: targetLocation.countryCode,
          region: targetLocation.region ?? undefined,
          month,
          category: 'fruit',
          forceRegenerate
        });

        setData(response);

        const nextLocationLabel = [targetLocation.city, targetLocation.region, targetLocation.countryCode]
          .filter(Boolean)
          .join(' • ');

        await writeWidgetPayload({
          title: "Today's Harvest",
          emojis: response.items.slice(0, 6).map((item) => item.emoji),
          locationLabel: nextLocationLabel || 'Location unavailable',
          monthLabel: monthLabel(response.month),
          updatedAt: response.updatedAt
        });

        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch seasonal data.');
        return null;
      } finally {
        setIsLoadingLocation(false);
      }
    },
    [getSeasonalItems, month]
  );

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        await seedCatalog({});
        const resolved = await requestAndResolveLocation();
        if (!mounted) {
          return;
        }
        setPermission(resolved.permission);
        setDraftLocation(
          resolved.resolved ?? {
            countryCode: '',
            region: null,
            city: null
          }
        );
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Initialization failed.');
      } finally {
        if (!mounted) {
          return;
        }
        setIsBooting(false);
      }
    };

    void boot();

    return () => {
      mounted = false;
    };
  }, [seedCatalog]);

  const handleOnboardingContinue = useCallback(async () => {
    const countryCode = draftLocation.countryCode.trim().toUpperCase();
    const region = draftLocation.region?.trim() || null;
    const city = draftLocation.city?.trim() || null;

    if (!countryCode) {
      setError('Please enter a country code to continue.');
      return;
    }

    setError(null);
    const nextLocation = {
      countryCode,
      region,
      city
    };
    setLocation(nextLocation);
    const response = await refreshSeasonal(nextLocation, false);
    if (!response) {
      return;
    }
    setIsOnboardingComplete(true);
  }, [draftLocation, refreshSeasonal]);

  return (
    <SafeAreaView style={styles.app}>
      <View style={styles.content}>
        {isBooting ? <Text style={styles.info}>Loading location…</Text> : null}

        {!isBooting && !isOnboardingComplete ? (
          <OnboardingScreen
            permissionStatus={permission}
            draftLocation={draftLocation}
            error={error}
            onChange={(next) => {
              setDraftLocation(next);
              if (error) {
                setError(null);
              }
            }}
            isSubmitting={isLoadingLocation}
            onContinue={handleOnboardingContinue}
          />
        ) : null}

        {!isBooting && isOnboardingComplete ? (
          <HomeScreen
            location={location}
            month={month}
            data={data}
            error={error}
            onUpdateLocation={() => {
              if (location) {
                setDraftLocation(location);
              }
              setIsOnboardingComplete(false);
            }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ConvexProvider client={convex}>
        <HarvestApp />
      </ConvexProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#F7F1E3'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12
  },
  info: {
    color: '#4E5A52'
  }
});
