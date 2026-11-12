import { Animated, StyleSheet, View } from 'react-native';

import Svg, { Path } from 'react-native-svg';

import { pokeball, wordmark } from '@/presentation/theme';

const SPARKS = 8;
const SPARK_SIZE = 14;

export interface CatchBurstProps {
  size: number;
  /** 0 → 1 while the ball is open: soft light around it. */
  glow: Animated.Value;
  /** 0 → 1 on the final click: ring and sparks flying out. */
  burst: Animated.Value;
}

function Spark({ color }: { color: string }) {
  return (
    <Svg width={SPARK_SIZE} height={SPARK_SIZE} viewBox="0 0 24 24">
      <Path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill={color} />
    </Svg>
  );
}

/** Light effects drawn behind the Poké Ball during the catch. */
export function CatchBurst({ size, glow, burst }: CatchBurstProps) {
  const ringOpacity = burst.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.9, 0] });
  const sparkOpacity = burst.interpolate({
    inputRange: [0, 0.15, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#FFF6C2',
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.8] }),
            transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2] }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: wordmark.yellow,
            opacity: ringOpacity,
            transform: [
              { scale: burst.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.4] }) },
            ],
          },
        ]}
      />
      {Array.from({ length: SPARKS }, (_, index) => {
        const angle = (index / SPARKS) * Math.PI * 2;
        const distance = size * 0.95;
        return (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              {
                opacity: sparkOpacity,
                transform: [
                  {
                    translateX: burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.cos(angle) * distance],
                    }),
                  },
                  {
                    translateY: burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.sin(angle) * distance],
                    }),
                  },
                  {
                    scale: burst.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0.4, 1.2, 0.6],
                    }),
                  },
                ],
              },
            ]}
          >
            <Spark color={index % 2 === 0 ? wordmark.yellow : pokeball.white} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
  },
});
