import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { ResolvedLocation } from '../lib/location';

type Props = {
  permissionStatus: Location.PermissionStatus | 'undetermined';
  draftLocation: ResolvedLocation;
  error: string | null;
  onChange: (next: ResolvedLocation) => void;
  onContinue: () => void;
};

export function OnboardingScreen({ permissionStatus, draftLocation, error, onChange, onContinue }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set your location</Text>
      <Text style={styles.subtitle}>We prefilled this from your device location. You can change it.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Country code (required)</Text>
        <TextInput
          style={styles.input}
          value={draftLocation.countryCode}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={2}
          placeholder="US"
          onChangeText={(countryCode) =>
            onChange({
              ...draftLocation,
              countryCode
            })
          }
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>State / Region (optional)</Text>
        <TextInput
          style={styles.input}
          value={draftLocation.region ?? ''}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="California"
          onChangeText={(region) =>
            onChange({
              ...draftLocation,
              region: region || null
            })
          }
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>City (optional)</Text>
        <TextInput
          style={styles.input}
          value={draftLocation.city ?? ''}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="San Francisco"
          onChangeText={(city) =>
            onChange({
              ...draftLocation,
              city: city || null
            })
          }
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Location permission</Text>
        <Text style={styles.value}>{permissionStatus}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#223127'
  },
  subtitle: {
    color: '#4E5A52',
    fontSize: 15
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 6
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
  input: {
    borderWidth: 1,
    borderColor: '#C8BCA7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#223127'
  },
  button: {
    marginTop: 8,
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
  error: {
    color: '#A02B1F'
  }
});
