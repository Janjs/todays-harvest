export function currentMonthInDeviceTimezone(): number {
  return new Date().getMonth() + 1;
}

export function monthLabel(month: number): string {
  return new Date(2025, month - 1, 1).toLocaleString(undefined, { month: 'long' });
}
