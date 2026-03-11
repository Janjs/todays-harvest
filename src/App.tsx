import { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { ConvexProvider, useAction, useMutation } from 'convex/react';
import * as Location from 'expo-location';
import { api } from '../convex/_generated/api';
import { SeasonalResponse } from '../shared/types';
import { convex } from './lib/convex';
import { buildCacheKey } from './lib/cacheKey';
import { currentMonthInDeviceTimezone, monthLabel } from './lib/date';
import { requestAndResolveLocation, ResolvedLocation } from './lib/location';
import { writeWidgetPayload } from './lib/widget';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { DeveloperScreen } from './screens/DeveloperScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';

type Tab = 'home' | 'settings' | 'developer';

function HarvestApp() {
  const [tab, setTab] = useState<Tab>('home');
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
  const [isLoading, setIsLoading] = useState(false);

  const month = useMemo(() => currentMonthInDeviceTimezone(), []);

  const seedCatalog = useMutation(api.catalog.seedCatalog);
  const getSeasonalItems = useAction(api.seasonal.getSeasonalItems);

  const locationLabel = useMemo(() => {
    if (!location) {
      return 'Location unavailable';
    }
    return [location.city, location.region, location.countryCode].filter(Boolean).join(' • ');
  }, [location]);

  const refreshSeasonal = useCallback(
    async (forceRegenerate = false) => {
      if (!location?.countryCode) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getSeasonalItems({
          countryCode: location.countryCode,
          region: location.region ?? undefined,
          month,
          category: 'fruit',
          forceRegenerate
        });

        setData(response);

        await writeWidgetPayload({
          title: "Today's Harvest",
          emojis: response.items.slice(0, 6).map((item) => item.emoji),
          locationLabel,
          monthLabel: monthLabel(response.month),
          updatedAt: response.updatedAt
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch seasonal data.');
      } finally {
        setIsLoading(false);
      }
    },
    [getSeasonalItems, location, locationLabel, month]
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

  useEffect(() => {
    void refreshSeasonal(false);
  }, [refreshSeasonal]);

  const cacheKey = location
    ? buildCacheKey({
        countryCode: location.countryCode,
        region: location.region,
        month,
        category: 'fruit'
      })
    : '';

  const handleOnboardingContinue = useCallback(() => {
    const countryCode = draftLocation.countryCode.trim().toUpperCase();
    const region = draftLocation.region?.trim() || null;
    const city = draftLocation.city?.trim() || null;

    if (!countryCode) {
      setError('Please enter a country code to continue.');
      return;
    }

    setError(null);
    setLocation({
      countryCode,
      region,
      city
    });
    setIsOnboardingComplete(true);
  }, [draftLocation]);

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
            onContinue={handleOnboardingContinue}
          />
        ) : null}

        {!isBooting && isOnboardingComplete && tab === 'home' ? (
          <HomeScreen
            locationLabel={locationLabel}
            month={month}
            data={data}
            isLoading={isLoading}
            error={error}
          />
        ) : null}

        {!isBooting && isOnboardingComplete && tab === 'settings' ? (
          <SettingsScreen
            permissionStatus={permission}
            cacheKey={cacheKey}
            source={data ? `${data.source}/${data.cacheStatus}` : 'N/A'}
            onRefresh={() => {
              void refreshSeasonal(false);
            }}
            onToggleDeveloper={() => setTab('developer')}
          />
        ) : null}

        {!isBooting && isOnboardingComplete && tab === 'developer' ? (
          <DeveloperScreen
            data={data}
            onRegenerate={() => {
              void refreshSeasonal(true);
            }}
          />
        ) : null}
      </View>

      {!isBooting && isOnboardingComplete ? (
        <View style={styles.tabs}>
          <TabButton label="Home" active={tab === 'home'} onPress={() => setTab('home')} />
          <TabButton label="Settings" active={tab === 'settings'} onPress={() => setTab('settings')} />
        </View>
      ) : null}

      {!isBooting && isOnboardingComplete && tab === 'developer' ? (
        <Pressable style={styles.devClose} onPress={() => setTab('settings')}>
          <Text style={styles.devCloseText}>Close developer tools</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

function TabButton(props: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tabButton, props.active ? styles.tabButtonActive : null]} onPress={props.onPress}>
      <Text style={[styles.tabText, props.active ? styles.tabTextActive : null]}>{props.label}</Text>
    </Pressable>
  );
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <HarvestApp />
    </ConvexProvider>
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
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8BCA7'
  },
  tabButtonActive: {
    backgroundColor: '#2D7C4D',
    borderColor: '#2D7C4D'
  },
  tabText: {
    color: '#3D4B40',
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#FFFFFF'
  },
  devClose: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A15B1F',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  devCloseText: {
    color: '#A15B1F',
    fontWeight: '600'
  }
});
