import { Text, VStack, HStack } from '@expo/ui/swift-ui';
import { createWidget } from 'expo-widgets';
import { WidgetPayload } from '../shared/types';

const fallback: WidgetPayload = {
  title: "Today's Harvest",
  emojis: ['🍎', '🍐', '🍊'],
  locationLabel: 'Unknown location',
  monthLabel: 'This month',
  updatedAt: 0
};

function isWidgetPayload(value: unknown): value is WidgetPayload {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'title' in value &&
      'emojis' in value &&
      'locationLabel' in value &&
      'monthLabel' in value
  );
}

const renderTodaysHarvestWidget = (data: WidgetPayload) => {
  'widget';

  const payload = isWidgetPayload(data) ? data : fallback;

  return (
    <VStack spacing={6}>
      <Text>{payload.title}</Text>

      <HStack spacing={2}>
        {(payload.emojis.length > 0 ? payload.emojis : fallback.emojis).slice(0, 8).map((emoji, index) => (
          <Text key={`${emoji}-${index}`}>{emoji}</Text>
        ))}
      </HStack>

      <Text>{payload.locationLabel} • {payload.monthLabel}</Text>
    </VStack>
  );
};

export const todaysHarvestWidget = createWidget('TodaysHarvestWidget', renderTodaysHarvestWidget);

export default todaysHarvestWidget;
