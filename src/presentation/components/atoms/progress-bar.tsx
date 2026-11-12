import { View } from 'react-native';

import { useTheme } from '../../theme';

export interface ProgressBarProps {
  /** 0 to 1. */
  value: number;
  accessibilityLabel: string;
}

export function ProgressBar({ value, accessibilityLabel }: ProgressBarProps) {
  const { theme } = useTheme();
  const ratio = Math.max(0, Math.min(value, 1));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      style={{
        height: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surfaceMuted,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${ratio * 100}%`,
          height: '100%',
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.primary,
        }}
      />
    </View>
  );
}
