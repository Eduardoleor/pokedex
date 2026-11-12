import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import {
  ballFillDiameter,
  BAND_RATIO,
  BUTTON_INNER_RATIO,
  BUTTON_RATIO,
} from '@/presentation/components/atoms/pokeball-geometry';
import { useReduceMotion } from '@/presentation/hooks/use-reduce-motion';
import { pokeball } from '@/presentation/theme';

/**
 * Full-screen Poké Ball that splits open over the screen underneath: the continuation of
 * the onboarding catch, where the ball grows until it covers everything.
 */
export interface PokeballRevealProps {
  /** The ball stays closed, wobbling, until the screen underneath has something to show. */
  ready: boolean;
  onDone: () => void;
}

export function PokeballReveal({ ready, onDone }: PokeballRevealProps) {
  const { width, height } = useWindowDimensions();
  const diameter = ballFillDiameter(width, height);
  const band = diameter * BAND_RATIO;
  const button = diameter * BUTTON_RATIO;
  const buttonInner = diameter * BUTTON_INNER_RATIO;
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const [wobble] = useState(() => new Animated.Value(0));

  // While loading, the button blinks and the ball rocks like it is holding a catch.
  // The slight scale keeps the screen corners covered while it rocks.
  useEffect(() => {
    if (ready || reduceMotion) {
      return undefined;
    }
    const tilt = (toValue: number, duration: number) =>
      Animated.timing(wobble, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
    const loop = Animated.loop(
      Animated.sequence([tilt(1, 140), tilt(-1, 220), tilt(0, 140), Animated.delay(420)]),
    );
    loop.start();
    return () => {
      loop.stop();
      wobble.setValue(0);
    };
  }, [ready, reduceMotion, wobble]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (reduceMotion) {
      onDone();
      return;
    }
    Animated.sequence([
      Animated.delay(180),
      Animated.timing(progress, {
        toValue: 1,
        duration: 650,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  }, [onDone, progress, ready, reduceMotion]);

  const half = height / 2;
  const up = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -half - band] });
  const down = progress.interpolate({ inputRange: [0, 1], outputRange: [0, half + band] });
  const buttonScale = progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.15, 0] });
  const rock = wobble.interpolate({ inputRange: [-1, 1], outputRange: ['-2deg', '2deg'] });
  const blink = wobble.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.55, 1, 0.55] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { transform: [{ rotate: rock }, { scale: 1.1 }] }]}
      accessibilityElementsHidden
    >
      <Animated.View style={[styles.top, { height: half, transform: [{ translateY: up }] }]}>
        <View style={[styles.bandHalf, { height: band / 2 }]} />
      </Animated.View>
      <Animated.View style={[styles.bottom, { height: half, transform: [{ translateY: down }] }]}>
        <View style={[styles.bandHalf, { height: band / 2 }]} />
      </Animated.View>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.button,
            { width: button, height: button, borderRadius: button / 2 },
            { transform: [{ scale: buttonScale }] },
          ]}
        >
          <Animated.View
            style={{
              width: buttonInner,
              height: buttonInner,
              borderRadius: buttonInner / 2,
              backgroundColor: pokeball.white,
              opacity: blink,
            }}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: pokeball.red,
    justifyContent: 'flex-end',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: pokeball.white,
  },
  bandHalf: {
    backgroundColor: pokeball.black,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: pokeball.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
