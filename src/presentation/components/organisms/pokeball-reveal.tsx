import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useReduceMotion } from '../../hooks/use-reduce-motion';
import { pokeball } from '../../theme';
import {
  ballFillDiameter,
  BAND_RATIO,
  BUTTON_INNER_RATIO,
  BUTTON_RATIO,
} from '../atoms/pokeball-geometry';

/**
 * Full-screen Poké Ball that splits open over the screen underneath: the continuation of
 * the onboarding catch, where the ball grows until it covers everything.
 */
export function PokeballReveal({ onDone }: { onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const diameter = ballFillDiameter(width, height);
  const band = diameter * BAND_RATIO;
  const button = diameter * BUTTON_RATIO;
  const buttonInner = diameter * BUTTON_INNER_RATIO;
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
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
  }, [onDone, progress, reduceMotion]);

  const half = height / 2;
  const up = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -half - band] });
  const down = progress.interpolate({ inputRange: [0, 1], outputRange: [0, half + band] });
  const buttonScale = progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.15, 0] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
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
          <View
            style={{
              width: buttonInner,
              height: buttonInner,
              borderRadius: buttonInner / 2,
              backgroundColor: pokeball.white,
            }}
          />
        </Animated.View>
      </View>
    </View>
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
