import type * as React from 'react';

declare module 'expo-widgets' {
  export type WidgetEnvironment = {
    date: Date;
    widgetFamily:
      | 'systemSmall'
      | 'systemMedium'
      | 'systemLarge'
      | 'systemExtraLarge'
      | 'accessoryCircular'
      | 'accessoryRectangular'
      | 'accessoryInline';
  };

  export class Widget<T extends object = object> {
    reload(): void;
    updateSnapshot(props: T): void;
  }

  export function createWidget<T extends object = object>(
    name: string,
    widget: (props: T, context: WidgetEnvironment) => React.JSX.Element
  ): Widget<T>;
}

declare module '@expo/ui/swift-ui' {
  export const Text: any;
  export const VStack: any;
  export const HStack: any;
}
