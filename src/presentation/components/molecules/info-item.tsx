import { StyleSheet, View } from 'react-native';

import { Text } from '@/presentation/components/atoms';
import { useTheme } from '@/presentation/theme';

export interface InfoItemProps {
  label: string;
  value: string;
}

export function InfoItem({ label, value }: InfoItemProps) {
  const { theme } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.item, { gap: theme.spacing.xs }]}
    >
      <Text variant="heading" align="center">
        {value}
      </Text>
      <Text variant="caption" tone="textMuted" align="center">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
  },
});
