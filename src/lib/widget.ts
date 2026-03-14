import AsyncStorage from '@react-native-async-storage/async-storage';
import { WidgetPayload } from '../../shared/types';

const STORAGE_KEY = 'todays-harvest.widgetPayload';

export async function writeWidgetPayload(payload: WidgetPayload): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  try {
    const { todaysHarvestWidget } = await import('../../widgets/TodaysHarvestWidget');
    todaysHarvestWidget.updateSnapshot(payload);
    todaysHarvestWidget.reload();
  } catch (error) {
    // Widget APIs may be unavailable in non-widget runtime environments.
    console.warn('Failed to push widget payload', error);
  }
}

export async function readWidgetPayload(): Promise<WidgetPayload | null> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored) as WidgetPayload;
  } catch {
    return null;
  }
}
