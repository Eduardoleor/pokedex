import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, type GestureResponderEvent, StyleSheet, View } from 'react-native';

import { useReduceMotion } from '../../hooks/use-reduce-motion';
import type { ViewHandle } from '../../types';
import { Pokeball } from '../atoms';
import { CatchBurst, StickerLabel } from '../molecules';

const BALL_SIZE = 92;
/** Upward speed (px/ms) or distance (px) that counts as a throw. */
const THROW_VELOCITY = 0.6;
const THROW_DISTANCE = 110;
/** Movement below this is a tap, which also throws the ball. */
const TAP_SLOP = 6;
/** Where the ball lands after the catch, below the target's center. */
const DROP_OFFSET = 70;
/** Scale at which the ball covers any phone screen. */
const GROW_TO_FILL = 22;

export interface PokeballLauncherProps {
  /** View the ball flies to (the featured Pokémon). */
  targetRef: RefObject<ViewHandle | null>;
  /** Driven 0 → 1 while the Pokémon is pulled into the ball. */
  capture: Animated.Value;
  /** Sticker-style call to action shown next to the ball. */
  label: string;
  onThrow: () => void;
  onCaught: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface DragState {
  startX: number;
  startY: number;
  lastY: number;
  lastTime: number;
  velocityY: number;
}

function measureCenter(view: ViewHandle | null): Promise<Point | null> {
  return new Promise((resolve) => {
    if (!view) {
      resolve(null);
      return;
    }
    view.measureInWindow((x, y, width, height) =>
      resolve(width > 0 ? { x: x + width / 2, y: y + height / 2 } : null),
    );
  });
}

/**
 * Swipe the ball up (or tap it) to throw it at the featured Pokémon: it opens, pulls the
 * Pokémon in, closes, wobbles three times and clicks, then `onCaught` runs.
 */
export function PokeballLauncher({
  targetRef,
  capture,
  label,
  onThrow,
  onCaught,
}: PokeballLauncherProps) {
  const reduceMotion = useReduceMotion();
  const restRef = useRef<ViewHandle>(null);
  const drag = useRef<DragState>({ startX: 0, startY: 0, lastY: 0, lastTime: 0, velocityY: 0 });

  const [pan] = useState(() => new Animated.ValueXY());
  const [bob] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));
  const [tilt] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));
  const [open] = useState(() => new Animated.Value(0));
  const [burst] = useState(() => new Animated.Value(0));
  const [labelOpacity] = useState(() => new Animated.Value(1));
  const [isThrown, setIsThrown] = useState(false);

  // Idle float that hints the ball can be picked up.
  useEffect(() => {
    if (reduceMotion || isThrown) {
      return undefined;
    }
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -6, duration: 900, useNativeDriver: false }),
        Animated.timing(bob, { toValue: 0, duration: 900, useNativeDriver: false }),
      ]),
    );
    float.start();
    return () => float.stop();
  }, [bob, isThrown, reduceMotion]);

  const throwBall = useCallback(async () => {
    if (isThrown) {
      return;
    }
    setIsThrown(true);
    onThrow();
    Animated.timing(labelOpacity, { toValue: 0, duration: 200, useNativeDriver: false }).start();

    if (reduceMotion) {
      onCaught();
      return;
    }

    const [from, to] = await Promise.all([
      measureCenter(restRef.current),
      measureCenter(targetRef.current),
    ]);
    const target =
      from && to ? { x: to.x - from.x, y: to.y - from.y } : { x: 0, y: -BALL_SIZE * 3 };

    const grow = (toValue: number) =>
      Animated.timing(scale, {
        toValue,
        duration: 600,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      });

    const wobble = () =>
      Animated.sequence([
        Animated.delay(220),
        Animated.timing(tilt, { toValue: -1, duration: 110, useNativeDriver: false }),
        Animated.timing(tilt, { toValue: 1, duration: 160, useNativeDriver: false }),
        Animated.timing(tilt, { toValue: 0, duration: 110, useNativeDriver: false }),
      ]);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(pan, {
          toValue: target,
          duration: 480,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(spin, { toValue: 1, duration: 480, useNativeDriver: false }),
        Animated.timing(scale, { toValue: 0.7, duration: 480, useNativeDriver: false }),
      ]),
      Animated.timing(open, { toValue: 1, duration: 160, useNativeDriver: false }),
      Animated.timing(capture, {
        toValue: 1,
        duration: 380,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(open, { toValue: 0, duration: 140, useNativeDriver: false }),
      Animated.spring(pan, {
        toValue: { x: target.x, y: target.y + DROP_OFFSET },
        bounciness: 12,
        speed: 14,
        useNativeDriver: false,
      }),
      // Each wobble the ball grows a little, building up to the catch.
      Animated.parallel([wobble(), grow(0.82)]),
      Animated.parallel([wobble(), grow(0.94)]),
      Animated.parallel([wobble(), grow(1.06)]),
      Animated.timing(burst, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      // Fills the screen with the ball; the home screen opens it (see PokeballReveal).
      Animated.timing(scale, {
        toValue: GROW_TO_FILL,
        duration: 520,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onCaught();
      }
    });
  }, [
    burst,
    capture,
    isThrown,
    labelOpacity,
    onCaught,
    onThrow,
    open,
    pan,
    reduceMotion,
    scale,
    spin,
    targetRef,
    tilt,
  ]);

  const returnToRest = useCallback(() => {
    Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: false }).start();
  }, [pan]);

  const onGrant = useCallback(
    ({ nativeEvent }: GestureResponderEvent) => {
      drag.current = {
        startX: nativeEvent.pageX,
        startY: nativeEvent.pageY,
        lastY: nativeEvent.pageY,
        lastTime: nativeEvent.timestamp,
        velocityY: 0,
      };
      bob.setValue(0);
    },
    [bob],
  );

  const onMove = useCallback(
    ({ nativeEvent }: GestureResponderEvent) => {
      const state = drag.current;
      const elapsed = nativeEvent.timestamp - state.lastTime;
      if (elapsed > 0) {
        state.velocityY = (nativeEvent.pageY - state.lastY) / elapsed;
      }
      state.lastY = nativeEvent.pageY;
      state.lastTime = nativeEvent.timestamp;
      pan.setValue({ x: nativeEvent.pageX - state.startX, y: nativeEvent.pageY - state.startY });
    },
    [pan],
  );

  const onRelease = useCallback(
    ({ nativeEvent }: GestureResponderEvent) => {
      const { startX, startY, velocityY } = drag.current;
      const dx = nativeEvent.pageX - startX;
      const dy = nativeEvent.pageY - startY;
      const isTap = Math.abs(dx) < TAP_SLOP && Math.abs(dy) < TAP_SLOP;
      const isThrow = velocityY < -THROW_VELOCITY || dy < -THROW_DISTANCE;

      if (isTap || isThrow) {
        void throwBall();
      } else {
        returnToRest();
      }
    },
    [returnToRest, throwBall],
  );

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });
  const wobbleRotate = tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-16deg', '16deg'] });

  return (
    <View style={styles.container}>
      <View
        ref={restRef}
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Swipe up or double tap to throw the Poké Ball"
        accessibilityActions={[{ name: 'activate' }]}
        // Screen readers have no swipe: activating the ball throws it.
        onAccessibilityAction={() => void throwBall()}
        style={{ width: BALL_SIZE, height: BALL_SIZE }}
      >
        {/* Effects follow the ball's position but not its spin. */}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.layer,
            { transform: [{ translateX: pan.x }, { translateY: Animated.add(pan.y, bob) }] },
          ]}
        >
          <CatchBurst size={BALL_SIZE} glow={open} burst={burst} />
          <Animated.View
            onStartShouldSetResponder={() => !isThrown}
            onMoveShouldSetResponder={() => !isThrown}
            onResponderGrant={onGrant}
            onResponderMove={onMove}
            onResponderRelease={onRelease}
            onResponderTerminate={returnToRest}
            style={[styles.ball, { transform: [{ rotate }, { rotate: wobbleRotate }, { scale }] }]}
          >
            <Pokeball size={BALL_SIZE} open={open} />
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.sticker, { opacity: labelOpacity }]} pointerEvents="none">
        <StickerLabel text={label} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sticker: {
    marginTop: 14,
  },

  ball: {
    zIndex: 10,
    // Without a radius the web shadow is drawn as a square box.
    borderRadius: BALL_SIZE / 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
