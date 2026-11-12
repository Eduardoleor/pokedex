import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { useReduceMotion } from '../../hooks/use-reduce-motion';
import { MIN_TOUCH_SIZE, useTheme } from '../../theme';
import { Icon, Pokeball, Text } from '../atoms';

export interface PokeballHeaderButtonProps {
  count: number;
  /** When true the ball shakes, like a catch in progress, to point at the new catch. */
  celebrate: boolean;
  onCelebrated: () => void;
  onPress: () => void;
}

/** Header Poké Ball that opens the caught Pokémon; full color once it holds any. */
export function PokeballHeaderButton({
  count,
  celebrate,
  onCelebrated,
  onPress,
}: PokeballHeaderButtonProps) {
  const { theme } = useTheme();
  const reduceMotion = useReduceMotion();
  const [shake] = useState(() => new Animated.Value(0));
  const [pop] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!celebrate) {
      return undefined;
    }
    if (reduceMotion) {
      onCelebrated();
      return undefined;
    }
    const tilt = (to: number, duration = 90) =>
      Animated.timing(shake, {
        toValue: to,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
    // Three wobbles with pauses, like a Poké Ball deciding whether the catch holds.
    const wobble = Animated.sequence([tilt(1), tilt(-1, 160), tilt(0), Animated.delay(260)]);
    const animation = Animated.sequence([
      Animated.delay(250),
      Animated.spring(pop, { toValue: 1.3, friction: 4, useNativeDriver: true }),
      wobble,
      wobble,
      wobble,
      Animated.spring(pop, { toValue: 1, friction: 3, tension: 120, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => finished && onCelebrated());
    return () => animation.stop();
  }, [celebrate, onCelebrated, pop, reduceMotion, shake]);

  const rotate = shake.interpolate({ inputRange: [-1, 1], outputRange: ['-25deg', '25deg'] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Caught Pokémon, ${count}`}
      accessibilityHint="Opens the Pokémon you caught"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.base, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Animated.View
        style={{ transformOrigin: '50% 90%', transform: [{ rotate }, { scale: pop }] }}
      >
        {count > 0 ? (
          <Pokeball size={28} />
        ) : (
          <Icon name="pokeball" size={26} color={theme.colors.onHeader} />
        )}
      </Animated.View>
      {count > 0 ? (
        <View
          pointerEvents="none"
          style={[
            styles.count,
            { backgroundColor: theme.colors.accent, borderColor: theme.colors.header },
          ]}
        >
          <Text
            style={[styles.countText, { color: theme.colors.onAccent }]}
            maxFontSizeMultiplier={1.2}
          >
            {count > 99 ? '99+' : String(count)}
          </Text>
        </View>
      ) : null}
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
  count: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
  },
});
