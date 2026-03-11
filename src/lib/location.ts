import * as Location from 'expo-location';

export type ResolvedLocation = {
  countryCode: string;
  region: string | null;
  city: string | null;
};

export async function requestAndResolveLocation(): Promise<{
  permission: Location.PermissionStatus;
  resolved: ResolvedLocation | null;
}> {
  const permissionResult = await Location.requestForegroundPermissionsAsync();
  if (permissionResult.status !== 'granted') {
    return {
      permission: permissionResult.status,
      resolved: null
    };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  const [geo] = await Location.reverseGeocodeAsync(position.coords);
  if (!geo?.isoCountryCode) {
    return {
      permission: permissionResult.status,
      resolved: null
    };
  }

  return {
    permission: permissionResult.status,
    resolved: {
      countryCode: geo.isoCountryCode.toUpperCase(),
      region: geo.region ?? null,
      city: geo.city ?? null
    }
  };
}
