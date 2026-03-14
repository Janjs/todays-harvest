import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { ResolvedLocation } from '../lib/location';
import { countryCodeToFlagUri, COUNTRY_OPTIONS } from '../lib/countries';

type Props = {
  permissionStatus: Location.PermissionStatus | 'undetermined';
  draftLocation: ResolvedLocation;
  error: string | null;
  isSubmitting: boolean;
  onChange: (next: ResolvedLocation) => void;
  onContinue: () => Promise<void>;
};

export function OnboardingScreen({
  permissionStatus,
  draftLocation,
  error,
  isSubmitting,
  onChange,
  onContinue
}: Props) {
  const insets = useSafeAreaInsets();
  const [countryQuery, setCountryQuery] = useState('');
  const [showCountryOptions, setShowCountryOptions] = useState(Platform.OS !== 'ios');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [pickerCountryCode, setPickerCountryCode] = useState(draftLocation.countryCode || COUNTRY_OPTIONS[0].code);

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) {
      return COUNTRY_OPTIONS.slice(0, 12);
    }

    return COUNTRY_OPTIONS.filter(
      (country) => country.code.toLowerCase().includes(query) || country.name.toLowerCase().includes(query)
    ).slice(0, 12);
  }, [countryQuery]);

  const openCountrySelector = useCallback(() => {
    if (Platform.OS === 'ios') {
      setPickerCountryCode(draftLocation.countryCode || COUNTRY_OPTIONS[0].code);
      setShowCountryModal(true);
      return;
    }

    setShowCountryOptions((current) => !current);
  }, [draftLocation, onChange]);

  const applyCountryChange = useCallback(
    (nextCountryCode: string) => {
      const didCountryChange = draftLocation.countryCode !== nextCountryCode;
      onChange({
        ...draftLocation,
        countryCode: nextCountryCode,
        region: didCountryChange ? null : draftLocation.region,
        city: didCountryChange ? null : draftLocation.city
      });
    },
    [draftLocation, onChange]
  );

  const selectedCountry = useMemo(() => {
    const country = COUNTRY_OPTIONS.find((option) => option.code === draftLocation.countryCode);
    if (!country) {
      return {
        code: draftLocation.countryCode || '',
        name: draftLocation.countryCode || 'Select country'
      };
    }
    return country;
  }, [draftLocation.countryCode]);
  const selectedCountryFlagUri = useMemo(() => countryCodeToFlagUri(selectedCountry.code), [selectedCountry.code]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Set your location</Text>
        <Text style={styles.subtitle}>We prefilled this from your device location. You can change it.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Country (required)</Text>
          <Pressable style={styles.selector} onPress={openCountrySelector}>
            <View style={styles.countryMain}>
              {selectedCountryFlagUri ? (
                <Image source={{ uri: selectedCountryFlagUri }} style={styles.flagIcon} />
              ) : null}
              <View>
                <Text style={styles.selectorText}>{selectedCountry.name}</Text>
                {selectedCountry.code ? <Text style={styles.selectorCode}>{selectedCountry.code}</Text> : null}
              </View>
            </View>
            <Text style={styles.selectorHint}>Choose</Text>
          </Pressable>

          {Platform.OS !== 'ios' && showCountryOptions ? (
            <View style={styles.dropdown}>
              <TextInput
                style={styles.input}
                value={countryQuery}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Search country or code"
                onChangeText={setCountryQuery}
              />
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {filteredCountries.map((country) => {
                  const countryFlagUri = countryCodeToFlagUri(country.code);
                  return (
                    <Pressable
                      key={country.code}
                      style={styles.option}
                      onPress={() => {
                        applyCountryChange(country.code);
                        setCountryQuery('');
                        setShowCountryOptions(false);
                      }}
                    >
                      <View style={styles.countryMain}>
                        {countryFlagUri ? <Image source={{ uri: countryFlagUri }} style={styles.flagIcon} /> : null}
                        <View>
                          <Text style={styles.optionText}>{country.name}</Text>
                          <Text style={styles.optionSubtext}>{country.code}</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
        {Platform.OS === 'ios' ? (
          <Modal
            animationType="slide"
            transparent
            visible={showCountryModal}
            onRequestClose={() => setShowCountryModal(false)}
          >
            <View style={styles.modalBackdrop}>
              <SafeAreaView style={styles.modalSheet}>
                <View style={styles.modalActions}>
                  <Pressable onPress={() => setShowCountryModal(false)}>
                    <Text style={styles.modalActionText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      applyCountryChange(pickerCountryCode);
                      setShowCountryModal(false);
                    }}
                  >
                    <Text style={styles.modalActionTextDone}>Done</Text>
                  </Pressable>
                </View>
                <Picker selectedValue={pickerCountryCode} onValueChange={(value) => setPickerCountryCode(value)}>
                  {COUNTRY_OPTIONS.map((country) => (
                    <Picker.Item
                      key={country.code}
                      label={`${country.name} (${country.code})`}
                      value={country.code}
                    />
                  ))}
                </Picker>
              </SafeAreaView>
            </View>
          </Modal>
        ) : null}

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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.button, isSubmitting ? styles.buttonDisabled : null]}
          disabled={isSubmitting}
          onPress={onContinue}
        >
          {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Continue</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  form: {
    flex: 1
  },
  formContent: {
    gap: 12,
    paddingBottom: 16
  },
  footer: {
    paddingTop: 12,
    backgroundColor: '#F7F1E3',
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
  selector: {
    borderWidth: 1,
    borderColor: '#C8BCA7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectorText: {
    color: '#223127',
    fontSize: 15,
    fontWeight: '600'
  },
  countryMain: {
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
  selectorCode: {
    color: '#4E5A52',
    fontSize: 12,
    marginTop: 2
  },
  selectorHint: {
    color: '#4E5A52',
    fontSize: 13
  },
  dropdown: {
    marginTop: 8,
    gap: 8
  },
  dropdownList: {
    maxHeight: 180
  },
  option: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE2D0'
  },
  optionText: {
    color: '#223127',
    fontSize: 14
  },
  optionSubtext: {
    color: '#4E5A52',
    fontSize: 12
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
    backgroundColor: '#2D7C4D',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  error: {
    color: '#A02B1F'
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalSheet: {
    backgroundColor: '#F7F1E3',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 12
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12
  },
  modalActionText: {
    color: '#4E5A52',
    fontSize: 16
  },
  modalActionTextDone: {
    color: '#2D7C4D',
    fontSize: 16,
    fontWeight: '600'
  }
});
