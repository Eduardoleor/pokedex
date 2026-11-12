import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../../theme';
import { Icon, type IconName, Spinner, Surface, Text } from '../../atoms';

export interface SettingsAction {
  key: string;
  icon: IconName;
  /** Background of the icon square. */
  color: string;
  title: string;
  detail: string;
  destructive?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onPress: () => void;
}

/** iOS-style grouped list: colored icon squares, title, detail and a chevron. */
export function SettingsGroup({ actions }: { actions: SettingsAction[] }) {
  const { theme } = useTheme();

  return (
    <Surface padded={false}>
      {actions.map((action, index) => (
        <View key={action.key}>
          {index > 0 ? (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: theme.colors.border,
                marginLeft: 64,
              }}
            />
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityHint={action.detail}
            accessibilityState={{ disabled: action.disabled || action.busy, busy: action.busy }}
            disabled={action.disabled || action.busy}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.row,
              {
                gap: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                opacity: action.disabled ? 0.4 : 1,
                backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
              },
            ]}
          >
            <View style={[styles.square, { backgroundColor: action.color }]}>
              <Icon name={action.icon} size={18} color="#FFFFFF" />
            </View>
            <View style={styles.flex}>
              <Text variant="label" tone={action.destructive ? 'danger' : 'textPrimary'}>
                {action.title}
              </Text>
              <Text variant="caption" tone="textMuted">
                {action.detail}
              </Text>
            </View>
            {action.busy ? <Spinner size={20} /> : null}
          </Pressable>
        </View>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  square: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
});
