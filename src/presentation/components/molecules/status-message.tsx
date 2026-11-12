import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import { Button, Text } from '../atoms';

export interface StatusMessageProps {
  icon: string;
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
      <Text variant="display" align="center" importantForAccessibility="no">
        {icon}
      </Text>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text tone="textSecondary" align="center">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          icon="↻"
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
