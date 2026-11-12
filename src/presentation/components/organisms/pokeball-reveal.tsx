import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useReduceMotion } from '../../hooks/use-reduce-motion';
import { pokeball } from '../../theme';

const BAND = 18;
const BUTTON = 64;

/**
 * Full-screen Poké Ball that splits open over the screen underneath: the continuation of
 * the onboarding catch, where the ball grows until it covers everything.
 */
export function PokeballReveal({ onDone }: { onDone: () => void }) {
  const { height } = useWindowDimensions();
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
  const up = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -half - BAND] });
  const down = progress.interpolate({ inputRange: [0, 1], outputRange: [0, half + BAND] });
  const buttonScale = progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.15, 0] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      <Animated.View style={[styles.top, { height: half, transform: [{ translateY: up }] }]}>
        <View style={styles.bandTop} />
      </Animated.View>
      <Animated.View style={[styles.bottom, { height: half, transform: [{ translateY: down }] }]}>
        <View style={styles.bandBottom} />
      </Animated.View>
      <View style={styles.center}>
        <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
          <View style={styles.buttonInner} />
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
  bandTop: {
    height: BAND / 2,
    backgroundColor: pokeball.black,
  },
  bandBottom: {
    height: BAND / 2,
    backgroundColor: pokeball.black,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: BUTTON / 2,
    backgroundColor: pokeball.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    width: BUTTON * 0.6,
    height: BUTTON * 0.6,
    borderRadius: BUTTON * 0.3,
    backgroundColor: pokeball.white,
  },
});
