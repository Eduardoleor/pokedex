import { Pressable, type PressableProps, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, useTheme } from '../../theme';
import { Text } from './text';

export interface IconButtonProps extends Omit<PressableProps, 'children'> {
  /** Glyph shown inside the button. */
  icon: string;
  accessibilityLabel: string;
}

export function IconButton({ icon, style, ...rest }: IconButtonProps) {
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
      <Text variant="heading" tone="textPrimary" importantForAccessibility="no">
        {icon}
      </Text>
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
