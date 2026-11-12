import { Pressable, type PressableProps, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, useTheme } from '../../theme';
import { Icon, type IconName } from './icon';

export interface IconButtonProps extends Omit<PressableProps, 'children'> {
  icon: IconName;
  accessibilityLabel: string;
  color?: string;
}

export function IconButton({ icon, color, style, ...rest }: IconButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      style={(state) => [
        styles.base,
        { borderRadius: theme.radius.pill, opacity: state.pressed ? 0.6 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Icon name={icon} size={22} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: MIN_TOUCH_SIZE,
    minHeight: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
