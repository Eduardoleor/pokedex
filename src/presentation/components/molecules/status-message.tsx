import { StyleSheet, View } from 'react-native';

import { Button, Icon, type IconName, Text } from '@/presentation/components/atoms';
import { useTheme } from '@/presentation/theme';

export interface StatusMessageProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusMessage({ icon, title, message, actionLabel, onAction }: StatusMessageProps) {
  const { theme } = useTheme();

  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { gap: theme.spacing.md, padding: theme.spacing.xl }]}
    >
      <Icon name={icon} size={48} tone="textMuted" />
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text tone="textSecondary" align="center">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          icon="refresh"
          onPress={onAction}
          style={{ marginTop: theme.spacing.sm }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
