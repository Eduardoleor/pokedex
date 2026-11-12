import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName, Text } from '@/presentation/components/atoms';
import { MIN_TOUCH_SIZE, useTheme } from '@/presentation/theme';
import { ThemePreference } from '@/presentation/types';
import { haptics } from '@/presentation/utils';

const OPTIONS: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: ThemePreference.System, label: 'System', icon: 'device' },
  { value: ThemePreference.Light, label: 'Light', icon: 'sun' },
  { value: ThemePreference.Dark, label: 'Dark', icon: 'moon' },
];

/** Segmented control for the app theme. */
export function ThemePicker() {
  const { theme, preference, setPreference } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      style={[
        styles.group,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radius.pill,
          padding: theme.spacing.xs,
        },
      ]}
    >
      {OPTIONS.map((option) => {
        const selected = option.value === preference;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label} theme`}
            onPress={() => {
              haptics.selection();
              setPreference(option.value);
            }}
            style={[
              styles.option,
              {
                gap: theme.spacing.xs,
                borderRadius: theme.radius.pill,
                backgroundColor: selected ? theme.colors.primary : 'transparent',
              },
            ]}
          >
            <Icon name={option.icon} size={16} tone={selected ? 'onPrimary' : 'textSecondary'} />
            <Text variant="label" tone={selected ? 'onPrimary' : 'textSecondary'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
  },
  option: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE - 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
