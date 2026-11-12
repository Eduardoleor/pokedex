import { Animated, StyleSheet, View } from 'react-native';

import { Icon } from '@/presentation/components/atoms';
import { StickerLabel } from '@/presentation/components/molecules';
import { pokeball, wordmark } from '@/presentation/theme';

/** Sparkles placed around the artwork, as angle (deg) and distance (0–1 of the radius). */
const SPARKS = [
  { angle: -80, distance: 0.95, size: 22 },
  { angle: -30, distance: 0.85, size: 16 },
  { angle: 15, distance: 1, size: 20 },
  { angle: 60, distance: 0.8, size: 14 },
  { angle: 120, distance: 0.95, size: 18 },
  { angle: 165, distance: 0.85, size: 14 },
  { angle: 210, distance: 1, size: 22 },
  { angle: 250, distance: 0.8, size: 16 },
];
const RADIUS = 150;

export interface CatchCelebrationProps {
  /** 0 → 1 plays the burst once: ring, sparkles and the sticker. */
  progress: Animated.Value;
  label: string;
  /** Color of the expanding ring. */
  color?: string;
}

/** Feedback over the artwork after a catch or a release. */
export function CatchCelebration({
  progress,
  label,
  color = wordmark.yellow,
}: CatchCelebrationProps) {
  const ringScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.2, 2.2] });
  const ringOpacity = progress.interpolate({
    inputRange: [0, 0.1, 0.7, 1],
    outputRange: [0, 0.9, 0.3, 0],
  });
  const sparkOpacity = progress.interpolate({
    inputRange: [0, 0.15, 0.75, 1],
    outputRange: [0, 1, 1, 0],
  });
  const stickerScale = progress.interpolate({
    inputRange: [0, 0.18, 0.3, 0.85, 1],
    outputRange: [0.3, 1.25, 1, 1, 0.8],
  });
  const stickerOpacity = progress.interpolate({
    inputRange: [0, 0.12, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.center]}
      accessibilityElementsHidden
    >
      <Animated.View
        style={[
          styles.ring,
          { borderColor: color, opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />
      {SPARKS.map((spark) => {
        const radians = (spark.angle * Math.PI) / 180;
        const travel = progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
        return (
          <Animated.View
            key={spark.angle}
            style={[
              styles.spark,
              {
                opacity: sparkOpacity,
                transform: [
                  {
                    translateX: Animated.multiply(
                      travel,
                      Math.cos(radians) * RADIUS * spark.distance,
                    ),
                  },
                  {
                    translateY: Animated.multiply(
                      travel,
                      Math.sin(radians) * RADIUS * spark.distance,
                    ),
                  },
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0.2, 1.2, 0.6],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon
              name="star"
              size={spark.size}
              color={spark.angle % 60 === 0 ? pokeball.white : color}
            />
          </Animated.View>
        );
      })}
      <Animated.View
        style={[styles.sticker, { opacity: stickerOpacity, transform: [{ scale: stickerScale }] }]}
      >
        <StickerLabel text={label} size="large" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
  },
  spark: {
    position: 'absolute',
  },
  sticker: {
    position: 'absolute',
    bottom: 28,
  },
});
