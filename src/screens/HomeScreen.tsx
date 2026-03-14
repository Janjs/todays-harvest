import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SeasonalResponse } from '../../shared/types';
import { EmojiGrid } from '../components/EmojiGrid';
import { COUNTRY_OPTIONS, countryCodeToFlagUri } from '../lib/countries';
import { ResolvedLocation } from '../lib/location';

export function HomeScreen(props: {
  location: ResolvedLocation | null;
  fruitData: SeasonalResponse | null;
  vegetableData: SeasonalResponse | null;
  error: string | null;
  isLoading: boolean;
  widgetShowFruits: boolean;
  widgetShowVegetables: boolean;
  onToggleWidgetFruits: (value: boolean) => void;
  onToggleWidgetVegetables: (value: boolean) => void;
  onUpdateLocation: () => void;
}) {
  const {
    location,
    fruitData,
    vegetableData,
    error,
    isLoading,
    widgetShowFruits,
    widgetShowVegetables,
    onToggleWidgetFruits,
    onToggleWidgetVegetables,
    onUpdateLocation
  } = props;
  const country = COUNTRY_OPTIONS.find((option) => option.code === location?.countryCode);
  const countryName = country?.name ?? location?.countryCode ?? 'Location unavailable';
  const countryFlagUri = location?.countryCode ? countryCodeToFlagUri(location.countryCode) : null;
  const locationParts = [location?.city, location?.region].filter(Boolean).join(' • ');
  const fruitAnimation = useRef(new Animated.Value(widgetShowFruits ? 1 : 0)).current;
  const vegetableAnimation = useRef(new Animated.Value(widgetShowVegetables ? 1 : 0)).current;
  const [showFruitItems, setShowFruitItems] = useState(widgetShowFruits);
  const [showVegetableItems, setShowVegetableItems] = useState(widgetShowVegetables);

  useEffect(() => {
    if (widgetShowFruits) {
      setShowFruitItems(true);
      fruitAnimation.setValue(0.84);
      Animated.spring(fruitAnimation, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 180,
        mass: 0.7
      }).start();
      return;
    }

    Animated.timing(fruitAnimation, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        setShowFruitItems(false);
      }
    });
  }, [fruitAnimation, widgetShowFruits]);

  useEffect(() => {
    if (widgetShowVegetables) {
      setShowVegetableItems(true);
      vegetableAnimation.setValue(0.84);
      Animated.spring(vegetableAnimation, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 180,
        mass: 0.7
      }).start();
      return;
    }

    Animated.timing(vegetableAnimation, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        setShowVegetableItems(false);
      }
    });
  }, [vegetableAnimation, widgetShowVegetables]);

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <View style={styles.headerGroup}>
          <Text style={styles.title}>Today's Harvest</Text>
          <Text style={styles.intro}>A widget app for in-season fruits and vegetables near you this month.</Text>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.locationTextWrap}>
            <View style={styles.countryRow}>
              {countryFlagUri ? <Image source={{ uri: countryFlagUri }} style={styles.flagIcon} /> : null}
              <Text style={styles.subtitle}>{countryName}</Text>
            </View>
            {locationParts ? <Text style={styles.subLocation}>{locationParts}</Text> : null}
          </View>
          <View style={styles.actionColumn}>
            <Pressable style={styles.updateButton} onPress={onUpdateLocation}>
              <Ionicons name="pencil" size={15} color="#2D7C4D" style={styles.updateButtonIcon} />
              <Text style={styles.updateButtonText}>Edit</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.fruitSection}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {isLoading ? <Text style={styles.loading}>Loading seasonal fruits and vegetables…</Text> : null}

        <View style={styles.sectionsStack}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.month}>Fruits</Text>
              <Switch value={widgetShowFruits} onValueChange={onToggleWidgetFruits} />
            </View>
            {showFruitItems ? (
              <Animated.View
                style={[
                  styles.itemsWrap,
                  {
                    opacity: fruitAnimation,
                    transform: [
                      {
                        scale: fruitAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.75, 1]
                        })
                      },
                      {
                        translateY: fruitAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <EmojiGrid items={fruitData?.items.slice(0, 4).map((item) => ({ emoji: item.emoji, name: item.name })) ?? []} />
              </Animated.View>
            ) : null}
          </View>
  
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.month}>Vegetables</Text>
              <Switch value={widgetShowVegetables} onValueChange={onToggleWidgetVegetables} />
            </View>
            {showVegetableItems ? (
              <Animated.View
                style={[
                  styles.itemsWrap,
                  {
                    opacity: vegetableAnimation,
                    transform: [
                      {
                        scale: vegetableAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.75, 1]
                        })
                      },
                      {
                        translateY: vegetableAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <EmojiGrid
                  items={vegetableData?.items.slice(0, 4).map((item) => ({ emoji: item.emoji, name: item.name })) ?? []}
                />
              </Animated.View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topContent: {
    gap: 18
  },
  headerGroup: {
    gap: 8
  },
  fruitSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 0,
    marginBottom: 16,
    marginTop: 12,
    paddingTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    gap: 16
  },
  section: {
    gap: 8
  },
  sectionsStack: {
    gap: 26
  },
  itemsWrap: {
    // Keep a named wrapper style for animated section items.
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#223127'
  },
  intro: {
    fontSize: 15,
    color: '#3D4B40',
    lineHeight: 20
  },
  subtitle: {
    fontSize: 17,
    color: '#3D4B40'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8
  },
  locationTextWrap: {
    flexShrink: 1,
    gap: 2,
    paddingLeft: 6
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  flagIcon: {
    width: 24,
    height: 18,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#ECE2D0',
    backgroundColor: '#FFF'
  },
  updateButton: {
    borderWidth: 1,
    borderColor: '#2D7C4D',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6
  },
  actionColumn: {
    gap: 8,
    alignItems: 'flex-end'
  },
  updateButtonIcon: {
    marginTop: 1
  },
  updateButtonText: {
    color: '#2D7C4D',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 16
  },
  month: {
    fontSize: 22,
    fontWeight: '600',
    color: '#223127',
    marginLeft: 6
  },
  subLocation: {
    color: '#4E5A52',
    fontSize: 14
  },
  error: {
    color: '#A02B1F'
  },
  loading: {
    color: '#4E5A52'
  }
});
