import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SeasonalResponse } from '../../shared/types';

type Props = {
  data: SeasonalResponse | null;
  onRegenerate: () => void;
};

export function DeveloperScreen({ data, onRegenerate }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Developer</Text>

      <Pressable style={styles.button} onPress={onRegenerate}>
        <Text style={styles.buttonText}>Trigger regeneration</Text>
      </Pressable>

      <ScrollView style={styles.payload}>
        <Text style={styles.payloadText}>{JSON.stringify(data, null, 2)}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    flex: 1
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#223127'
  },
  button: {
    backgroundColor: '#A15B1F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  payload: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12
  },
  payloadText: {
    color: '#E8E8E8',
    fontSize: 12
  }
});
