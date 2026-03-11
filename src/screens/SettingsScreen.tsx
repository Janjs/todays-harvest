import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  permissionStatus: string;
  cacheKey: string;
  source: string;
  onRefresh: () => void;
  onToggleDeveloper: () => void;
};

export function SettingsScreen({ permissionStatus, cacheKey, source, onRefresh, onToggleDeveloper }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Location permission</Text>
        <Text style={styles.value}>{permissionStatus}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Cache key</Text>
        <Text style={styles.value}>{cacheKey || 'N/A'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Data source</Text>
        <Text style={styles.value}>{source || 'N/A'}</Text>
      </View>

      <Pressable style={styles.button} onPress={onRefresh}>
        <Text style={styles.buttonText}>Refresh data</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onToggleDeveloper}>
        <Text style={styles.secondaryButtonText}>Developer tools</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#223127'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 4
  },
  label: {
    color: '#4E5A52',
    fontSize: 13
  },
  value: {
    color: '#223127',
    fontSize: 15,
    fontWeight: '600'
  },
  button: {
    backgroundColor: '#2D7C4D',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2D7C4D',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#2D7C4D',
    fontSize: 16,
    fontWeight: '600'
  }
});
