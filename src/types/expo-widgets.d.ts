import type * as React from 'react';

declare module 'expo-widgets' {
  export function createWidget(config: {
    name: string;
    render: (props: { data?: unknown }) => React.ReactNode;
  }): unknown;

  export function setWidgetData(widgetName: string, data: unknown): Promise<void>;
  export function reloadWidgets(): Promise<void>;
}

declare module '@expo/ui/swift-ui' {
  export const Text: any;
  export const VStack: any;
  export const HStack: any;
}
