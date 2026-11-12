import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { useReduceMotion } from '../../hooks/use-reduce-motion';
import { MIN_TOUCH_SIZE, useTheme } from '../../theme';
import type { CryStatus } from '../../types';
import { Icon, Spinner } from '../atoms';

export interface CryIconButtonProps {
  status: CryStatus;
  unavailableOffline: boolean;
  onPress: () => void;
}

/** Round glass button on the detail hero that plays the cry; it pulses while playing. */
export function CryIconButton({ status, unavailableOffline, onPress }: CryIconButtonProps) {
  const { theme } = useTheme();
  const reduceMotion = useReduceMotion();
  const [pulse] = useState(() => new Animated.Value(0));
  const isPlaying = status === 'playing';

  useEffect(() => {
    if (!isPlaying || reduceMotion) {
      pulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isPlaying, pulse, reduceMotion]);

  const label = unavailableOffline
    ? 'Cry unavailable offline'
    : status === 'error'
      ? "Couldn't play the cry, try again"
      : isPlaying
        ? 'Playing cry'
        : 'Play cry';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: unavailableOffline, busy: status === 'loading' }}
      disabled={unavailableOffline || isPlaying}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPlaying ? theme.colors.primary : `${theme.colors.surface}CC`,
          opacity: unavailableOffline ? 0.45 : pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
      ]}
    >
      {status === 'loading' ? (
        <Spinner size={22} />
      ) : (
        <Animated.View
          style={{
            transform: [
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
            ],
          }}
        >
          <Icon
            name={status === 'error' ? 'alert' : 'volume'}
            size={24}
            color={isPlaying ? theme.colors.onPrimary : theme.colors.primary}
          />
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH_SIZE + 8,
    height: MIN_TOUCH_SIZE + 8,
    borderRadius: (MIN_TOUCH_SIZE + 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
