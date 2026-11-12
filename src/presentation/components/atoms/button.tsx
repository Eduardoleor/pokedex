import { Pressable, type PressableProps, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/presentation/components/atoms/icon';
import { Spinner } from '@/presentation/components/atoms/spinner';
import { Text } from '@/presentation/components/atoms/text';
import { MIN_TOUCH_SIZE, useTheme } from '@/presentation/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: IconName;
  size?: 'regular' | 'large';
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  size = 'regular',
  style,
  ...rest
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled === true || loading;

  const background = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceMuted,
    ghost: 'transparent',
  }[variant];
  const tone = variant === 'primary' ? 'onPrimary' : 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={8}
      style={(state) => [
        styles.base,
        size === 'large' && styles.large,
        {
          backgroundColor: background,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.xl,
          opacity: isDisabled ? 0.5 : state.pressed ? 0.75 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <View style={[styles.content, { gap: theme.spacing.sm }]}>
        {loading ? (
          <Spinner size={18} />
        ) : icon ? (
          <Icon name={icon} size={size === 'large' ? 22 : 18} tone={tone} />
        ) : null}
        <Text variant={size === 'large' ? 'heading' : 'label'} tone={tone}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: {
    minHeight: 60,
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
