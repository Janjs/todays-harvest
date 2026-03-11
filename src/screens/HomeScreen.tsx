import { StyleSheet, Text, View } from 'react-native';
import { SeasonalResponse } from '../../shared/types';
import { monthLabel } from '../lib/date';
import { EmojiGrid } from '../components/EmojiGrid';

export function HomeScreen(props: {
  locationLabel: string;
  month: number;
  data: SeasonalResponse | null;
  isLoading: boolean;
  error: string | null;
}) {
  const { locationLabel, month, data, isLoading, error } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Harvest</Text>
      <Text style={styles.subtitle}>{locationLabel}</Text>
      <Text style={styles.month}>{monthLabel(month)}</Text>

      {isLoading ? <Text style={styles.info}>Loading seasonal produce...</Text> : null}
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
  month: {
    fontSize: 22,
    fontWeight: '600',
    color: '#223127'
  },
  info: {
    color: '#4E5A52'
  },
  error: {
    color: '#A02B1F'
  }
});
