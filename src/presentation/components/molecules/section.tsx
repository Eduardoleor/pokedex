import { StyleSheet, View } from 'react-native';

import type { ReactNode } from 'react';

import { useTheme } from '../../theme';
import { Text } from '../atoms';

export interface SectionProps {
  title: string;
  /** Optional link on the right of the title. */
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}

/** Small uppercase title over a block of content, used to pace long screens. */
export function Section({ title, action, onAction, children }: SectionProps) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={styles.header}>
        <Text variant="caption" tone="textMuted" accessibilityRole="header" style={styles.title}>
          {title.toUpperCase()}
        </Text>
        {action ? (
          <Text variant="label" tone="primary" onPress={onAction} accessibilityRole="button">
            {action}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    fontWeight: '800',
    letterSpacing: 1,
  },
});
