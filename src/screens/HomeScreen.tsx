import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SeasonalResponse } from '../../shared/types';
import { monthLabel } from '../lib/date';
import { EmojiGrid } from '../components/EmojiGrid';
import { COUNTRY_OPTIONS, countryCodeToFlagUri } from '../lib/countries';
import { ResolvedLocation } from '../lib/location';

export function HomeScreen(props: {
  location: ResolvedLocation | null;
  month: number;
  data: SeasonalResponse | null;
  error: string | null;
  onUpdateLocation: () => void;
}) {
  const { location, month, data, error, onUpdateLocation } = props;
  const country = COUNTRY_OPTIONS.find((option) => option.code === location?.countryCode);
  const countryName = country?.name ?? location?.countryCode ?? 'Location unavailable';
  const countryFlagUri = location?.countryCode ? countryCodeToFlagUri(location.countryCode) : null;
  const locationParts = [location?.city, location?.region].filter(Boolean).join(' • ');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Harvest</Text>
      <View style={styles.locationRow}>
        <View style={styles.locationTextWrap}>
          <View style={styles.countryRow}>
            {countryFlagUri ? <Image source={{ uri: countryFlagUri }} style={styles.flagIcon} /> : null}
            <Text style={styles.subtitle}>{countryName}</Text>
          </View>
          {locationParts ? <Text style={styles.subLocation}>{locationParts}</Text> : null}
        </View>
        <Pressable style={styles.updateButton} onPress={onUpdateLocation}>
          <Ionicons name="pencil" size={18} color="#2D7C4D" />
          <Text style={styles.updateButtonText}>Edit</Text>
        </Pressable>
      </View>
      <Text style={styles.month}>{monthLabel(month)}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <EmojiGrid items={data?.items.map((item) => ({ emoji: item.emoji, name: item.name })) ?? []} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#223127'
  },
  subtitle: {
    fontSize: 17,
    color: '#3D4B40'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  locationTextWrap: {
    flexShrink: 1,
    gap: 2
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
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  updateButtonText: {
    color: '#2D7C4D',
    fontWeight: '600',
    fontSize: 14
  },
  month: {
    fontSize: 22,
    fontWeight: '600',
    color: '#223127'
  },
  subLocation: {
    color: '#4E5A52',
    fontSize: 14
  },
  error: {
    color: '#A02B1F'
  }
});
