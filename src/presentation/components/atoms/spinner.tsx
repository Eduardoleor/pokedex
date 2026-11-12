import { useEffect, useState } from 'react';
import { Animated, Easing, type StyleProp, View, type ViewStyle } from 'react-native';

import { useReduceMotion } from '../../hooks/use-reduce-motion';
import { Pokeball } from './pokeball';

const SIZES = { small: 22, large: 40 } as const;

export interface SpinnerProps {
  size?: keyof typeof SIZES | number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Loading indicator: a Poké Ball that rolls, pauses and wobbles, like a catch in
 * progress. With reduce motion it only pulses gently.
 */
export function Spinner({ size = 'small', style }: SpinnerProps) {
  const diameter = typeof size === 'number' ? size : SIZES[size];
  const reduceMotion = useReduceMotion();
  const [turn] = useState(() => new Animated.Value(0));
  const [tilt] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const step = (value: Animated.Value, toValue: number, duration: number) =>
      Animated.timing(value, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
    const loop = reduceMotion
      ? Animated.loop(Animated.sequence([step(tilt, 0.4, 500), step(tilt, 0, 500)]))
      : Animated.loop(
          Animated.sequence([
            step(turn, 1, 700),
            step(tilt, 1, 110),
            step(tilt, -1, 160),
            step(tilt, 0, 110),
            Animated.delay(120),
            Animated.timing(turn, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, tilt, turn]);

  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const wobble = tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] });

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[{ alignSelf: 'center' }, style]}
    >
      <Animated.View
        style={{ transform: [{ rotate }, { rotate: wobble }], opacity: reduceMotion ? 0.9 : 1 }}
      >
        <Pokeball size={diameter} />
      </Animated.View>
    </View>
  );
}
