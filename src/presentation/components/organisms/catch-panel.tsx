import { type RefObject, useCallback, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import type { PokemonSummary } from '@/domain/models';
import { Button, Pokeball, Text } from '@/presentation/components/atoms';
import { StickerLabel } from '@/presentation/components/molecules';
import { PokeballLauncher } from '@/presentation/components/organisms/pokeball-launcher';
import { useReduceMotion } from '@/presentation/hooks/use-reduce-motion';
import { useTheme } from '@/presentation/theme';
import type { ViewHandle } from '@/presentation/types';
import { formatName, haptics } from '@/presentation/utils';

const BALL_SIZE = 64;

export interface CatchPanelProps {
  pokemon: PokemonSummary;
  isCaught: boolean;
  artworkRef: RefObject<ViewHandle | null>;
  /** 0 → 1 pulls the artwork into the ball. */
  capture: Animated.Value;
  /** Artwork emphasis: 1 makes it giant, −1 squashes it. */
  grow: Animated.Value;
  /** Drives the celebration drawn over the artwork. */
  celebrate: Animated.Value;
  /** Text the celebration shows, set right before it plays. */
  onCelebrate: (label: string) => void;
  /** Forwarded from the launcher: true while the ball is held. */
  onDragChange?: (dragging: boolean) => void;
  onCatch: (pokemon: PokemonSummary) => void;
  onRelease: (id: number) => void;
}

const timing = (
  value: Animated.Value,
  toValue: number,
  duration: number,
  easing = Easing.out(Easing.cubic),
) => Animated.timing(value, { toValue, duration, easing, useNativeDriver: false });

/**
 * Under the detail artwork: a Poké Ball to throw at the Pokémon, like in the onboarding,
 * or once it is caught, the ball it lives in and a way to release it. Both moments end
 * with feedback on the artwork: it grows giant when caught and hops out when released.
 */
export function CatchPanel({
  pokemon,
  isCaught,
  artworkRef,
  capture,
  grow,
  celebrate,
  onCelebrate,
  onDragChange,
  onCatch,
  onRelease,
}: CatchPanelProps) {
  const { theme } = useTheme();
  const reduceMotion = useReduceMotion();
  const name = formatName(pokemon.name);
  const [isThrown, setIsThrown] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [open] = useState(() => new Animated.Value(0));
  const [tilt] = useState(() => new Animated.Value(0));
  const [ballScale] = useState(() => new Animated.Value(1));

  const caught = useCallback(() => {
    onCatch(pokemon);
    setIsThrown(false);
    if (reduceMotion) {
      capture.setValue(0);
      return;
    }
    onCelebrate('Gotcha!');
    celebrate.setValue(0);
    // The Pokémon bursts back out giant, the celebration plays, then it settles.
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        timing(capture, 0, 380, Easing.out(Easing.back(1.4))),
        timing(celebrate, 1, 1500, Easing.out(Easing.quad)),
        // One sequence per value: two animations on the same value would stop each other.
        Animated.sequence([
          Animated.spring(grow, { toValue: 1, friction: 4, tension: 70, useNativeDriver: false }),
          Animated.delay(250),
          Animated.spring(grow, { toValue: 0, friction: 5, tension: 60, useNativeDriver: false }),
        ]),
      ]),
    ]).start();
  }, [capture, celebrate, grow, onCatch, onCelebrate, pokemon, reduceMotion]);

  const release = useCallback(() => {
    if (isReleasing) {
      return;
    }
    if (reduceMotion) {
      haptics.warning();
      onRelease(pokemon.id);
      return;
    }
    setIsReleasing(true);
    haptics.warning();
    onCelebrate('Bye-bye!');
    celebrate.setValue(0);
    const wobble = (to: number) => timing(tilt, to, 110, Easing.inOut(Easing.quad));
    // The ball shakes, pops open and vanishes while the Pokémon squashes and hops out.
    Animated.sequence([
      wobble(1),
      wobble(-1),
      wobble(0),
      Animated.parallel([
        timing(open, 1, 220),
        timing(celebrate, 1, 1200, Easing.out(Easing.quad)),
        Animated.sequence([
          timing(grow, -1, 140, Easing.in(Easing.quad)),
          Animated.spring(grow, {
            toValue: 0.5,
            friction: 3,
            tension: 120,
            useNativeDriver: false,
          }),
          Animated.spring(grow, { toValue: 0, friction: 5, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.delay(260),
          timing(ballScale, 0, 260, Easing.in(Easing.back(2))),
        ]),
      ]),
    ]).start(() => {
      onRelease(pokemon.id);
      open.setValue(0);
      ballScale.setValue(1);
      setIsReleasing(false);
    });
  }, [
    ballScale,
    celebrate,
    grow,
    isReleasing,
    onCelebrate,
    onRelease,
    open,
    pokemon.id,
    reduceMotion,
    tilt,
  ]);

  if (isCaught) {
    const rotate = tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] });
    return (
      <View style={[styles.caught, { gap: theme.spacing.sm, paddingTop: theme.spacing.md }]}>
        <Animated.View style={{ transform: [{ rotate }, { scale: ballScale }] }}>
          <Pokeball size={BALL_SIZE} open={open} />
        </Animated.View>
        <StickerLabel text={`${name} was caught!`} />
        <Button
          label={isReleasing ? 'Releasing…' : 'Release'}
          variant="ghost"
          disabled={isReleasing}
          accessibilityHint={`Removes ${name} from your caught Pokémon`}
          onPress={release}
        />
      </View>
    );
  }

  return (
    <View style={[styles.launcher, { paddingTop: theme.spacing.lg }]}>
      <PokeballLauncher
        targetRef={artworkRef}
        capture={capture}
        label={`Catch ${name}!`}
        finale="stay"
        size={76}
        onThrow={() => setIsThrown(true)}
        onDragChange={onDragChange}
        onCaught={caught}
      />
      <Text
        variant="caption"
        tone="textMuted"
        align="center"
        style={{ marginTop: theme.spacing.sm, opacity: isThrown ? 0 : 1 }}
      >
        Swipe the Poké Ball up or tap it
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caught: {
    alignItems: 'center',
  },
  launcher: {
    alignItems: 'center',
    zIndex: 20,
  },
});
