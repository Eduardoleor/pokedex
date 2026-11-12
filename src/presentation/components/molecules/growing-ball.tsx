import { Animated, StyleSheet, View } from 'react-native';

import { pokeball } from '../../theme';
import { BAND_RATIO, BUTTON_INNER_RATIO, BUTTON_RATIO } from '../atoms/pokeball-geometry';

export interface GrowingBallProps {
  /** Animated diameter in px. */
  diameter: Animated.Value;
  /** Diameter at which the ball covers the screen; the shading is gone by then. */
  fillDiameter: number;
  opacity: Animated.Value;
  translateX: Animated.Value;
  translateY: Animated.Value;
}

/**
 * Poké Ball built from plain views whose size is animated through layout. Unlike scaling a
 * rasterized SVG, every frame is redrawn at its real size, so it stays sharp at any size.
 */
export function GrowingBall({
  diameter,
  fillDiameter,
  opacity,
  translateX,
  translateY,
}: GrowingBallProps) {
  const radius = Animated.multiply(diameter, 0.5);
  const band = Animated.multiply(diameter, BAND_RATIO);
  const button = Animated.multiply(diameter, BUTTON_RATIO);
  const buttonInner = Animated.multiply(diameter, BUTTON_INNER_RATIO);
  // Volume is visible while the whole sphere is; it fades before the ball covers the screen,
  // where the flat full-screen reveal takes over.
  const shadingOpacity = diameter.interpolate({
    inputRange: [0, fillDiameter * 0.45, fillDiameter * 0.85],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ball,
        {
          width: diameter,
          height: diameter,
          borderRadius: radius,
          borderWidth: band,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      <View style={styles.top} />
      <Animated.View style={[styles.band, { height: band }]} />
      <View style={styles.bottom} />
      {/* Glossy highlight like the SVG ball's, sized by layout so it stays sharp. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            top: Animated.multiply(diameter, 0.1),
            left: Animated.multiply(diameter, 0.18),
            width: Animated.multiply(diameter, 0.3),
            height: Animated.multiply(diameter, 0.15),
            borderRadius: Animated.multiply(diameter, 0.075),
            opacity: shadingOpacity,
          },
        ]}
      />
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.button,
            { width: button, height: button, borderRadius: Animated.multiply(button, 0.5) },
          ]}
        >
          <Animated.View
            style={{
              width: buttonInner,
              height: buttonInner,
              borderRadius: Animated.multiply(buttonInner, 0.5),
              backgroundColor: pokeball.white,
            }}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    overflow: 'hidden',
    borderColor: pokeball.black,
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ rotate: '-24deg' }],
  },
  top: {
    flex: 1,
    backgroundColor: pokeball.red,
  },
  band: {
    backgroundColor: pokeball.black,
  },
  bottom: {
    flex: 1,
    backgroundColor: pokeball.white,
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
