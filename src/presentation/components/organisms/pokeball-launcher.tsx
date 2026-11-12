import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  type GestureResponderEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { useReduceMotion } from '../../hooks/use-reduce-motion';
import type { ViewHandle } from '../../types';
import { haptics } from '../../utils';
import { Pokeball } from '../atoms';
import { ballFillDiameter } from '../atoms/pokeball-geometry';
import { CatchBurst, GrowingBall, StickerLabel } from '../molecules';

const DEFAULT_BALL_SIZE = 92;
/** Upward speed (px/ms) or distance (px) that counts as a throw. */
const THROW_VELOCITY = 0.6;
const THROW_DISTANCE = 110;
/** Movement below this is a tap, which also throws the ball. */
const TAP_SLOP = 6;
/** Where the ball lands after the catch, below the target's center. */
const DROP_OFFSET = 70;
/** Ball scale right before it grows, so the growing ball starts at the same size. */
const CLICK_SCALE = 1.06;

export interface PokeballLauncherProps {
  /** View the ball flies to (the featured Pokémon). */
  targetRef: RefObject<ViewHandle | null>;
  /** Driven 0 → 1 while the Pokémon is pulled into the ball. */
  capture: Animated.Value;
  /** Sticker-style call to action shown next to the ball. */
  label: string;
  onThrow: () => void;
  onCaught: () => void;
  /** True while a finger holds the ball, so a parent scroll view can stay still. */
  onDragChange?: (dragging: boolean) => void;
  /**
   * `grow`: after the click the ball fills the screen (the onboarding hand-off).
   * `stay`: the ball rests where it landed, for catches inside a screen.
   */
  finale?: 'grow' | 'stay';
  /** Ball diameter at rest. */
  size?: number;
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

/** An animation step that fires `effect` (a haptic) when the sequence reaches it. */
function cue(effect: () => void): Animated.CompositeAnimation {
  return {
    start: (done) => {
      effect();
      done?.({ finished: true });
    },
    stop: () => undefined,
    reset: () => undefined,
  };
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
  onDragChange,
  finale = 'grow',
  size: ballSize = DEFAULT_BALL_SIZE,
}: PokeballLauncherProps) {
  const reduceMotion = useReduceMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const restRef = useRef<ViewHandle>(null);
  const drag = useRef<DragState>({ startX: 0, startY: 0, lastY: 0, lastTime: 0, velocityY: 0 });

  const [pan] = useState(() => new Animated.ValueXY());
  const [bob] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));
  const [tilt] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));
  const [open] = useState(() => new Animated.Value(0));
  const [burst] = useState(() => new Animated.Value(0));
  const [diameter] = useState(() => new Animated.Value(ballSize * CLICK_SCALE));
  const [growX] = useState(() => new Animated.Value(0));
  const [growY] = useState(() => new Animated.Value(0));
  const [growOpacity] = useState(() => new Animated.Value(0));
  const [ballOpacity] = useState(() => new Animated.Value(1));
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
    haptics.medium();
    Animated.timing(labelOpacity, { toValue: 0, duration: 200, useNativeDriver: false }).start();

    if (reduceMotion) {
      onCaught();
      return;
    }

    const [from, to] = await Promise.all([
      measureCenter(restRef.current),
      measureCenter(targetRef.current),
    ]);
    const target = from && to ? { x: to.x - from.x, y: to.y - from.y } : { x: 0, y: -ballSize * 3 };

    // Where the ball ends up, and how far that is from the screen's center.
    const landing = from
      ? { x: from.x + target.x, y: from.y + target.y + DROP_OFFSET }
      : { x: windowWidth / 2, y: windowHeight / 2 };
    const toCenter = { x: windowWidth / 2 - landing.x, y: windowHeight / 2 - landing.y };
    const fillDiameter = ballFillDiameter(windowWidth, windowHeight);
    const growTiming = {
      duration: 560,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false,
    } as const;

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
      cue(haptics.medium),
      Animated.timing(open, { toValue: 1, duration: 160, useNativeDriver: false }),
      Animated.timing(capture, {
        toValue: 1,
        duration: 380,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(open, { toValue: 0, duration: 140, useNativeDriver: false }),
      cue(haptics.heavy),
      Animated.spring(pan, {
        toValue: { x: target.x, y: target.y + DROP_OFFSET },
        bounciness: 12,
        speed: 14,
        useNativeDriver: false,
      }),
      // Each wobble the ball grows a little, building up to the catch.
      Animated.parallel([cue(haptics.light), wobble(), grow(0.82)]),
      Animated.parallel([cue(haptics.light), wobble(), grow(0.94)]),
      Animated.parallel([cue(haptics.light), wobble(), grow(CLICK_SCALE)]),
      cue(haptics.success),
      Animated.timing(burst, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      ...(finale === 'stay'
        ? []
        : [
            // Hand over to the view-built ball and grow it while sliding to the screen's center,
            // where the home screen opens it (see PokeballReveal).
            Animated.parallel([
              Animated.timing(ballOpacity, { toValue: 0, duration: 60, useNativeDriver: false }),
              Animated.timing(growOpacity, { toValue: 1, duration: 60, useNativeDriver: false }),
              Animated.timing(diameter, { toValue: fillDiameter, ...growTiming }),
              Animated.timing(growX, { toValue: toCenter.x, ...growTiming }),
              Animated.timing(growY, { toValue: toCenter.y, ...growTiming }),
            ]),
          ]),
    ]).start(({ finished }) => {
      if (finished) {
        onCaught();
      }
    });
  }, [
    ballOpacity,
    burst,
    capture,
    diameter,
    finale,
    growOpacity,
    growX,
    growY,
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
    windowHeight,
    windowWidth,
    ballSize,
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
      onDragChange?.(true);
    },
    [bob, onDragChange],
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
      onDragChange?.(false);

      if (isTap || isThrow) {
        void throwBall();
      } else {
        returnToRest();
      }
    },
    [onDragChange, returnToRest, throwBall],
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
        style={{ width: ballSize, height: ballSize }}
      >
        {/* Effects follow the ball's position but not its spin. */}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.layer,
            { transform: [{ translateX: pan.x }, { translateY: Animated.add(pan.y, bob) }] },
          ]}
        >
          <CatchBurst size={ballSize} glow={open} burst={burst} />
          <Animated.View
            // The native scroll view would claim the pan before the JS responder sees it,
            // so scrolling is locked the moment a finger lands on the ball.
            onTouchStart={() => !isThrown && onDragChange?.(true)}
            onTouchEnd={() => onDragChange?.(false)}
            onTouchCancel={() => onDragChange?.(false)}
            onStartShouldSetResponder={() => !isThrown}
            onMoveShouldSetResponder={() => !isThrown}
            onResponderGrant={onGrant}
            onResponderMove={onMove}
            onResponderRelease={onRelease}
            // A scroll view must not take the gesture away mid-throw.
            onResponderTerminationRequest={() => false}
            onResponderTerminate={() => {
              onDragChange?.(false);
              returnToRest();
            }}
            style={[
              styles.ball,
              {
                borderRadius: ballSize / 2,
                opacity: ballOpacity,
                transform: [{ rotate }, { rotate: wobbleRotate }, { scale }],
              },
            ]}
          >
            {/* Solid circle that carries the shadow; the SVG itself has no background. */}
            <View
              style={[
                styles.ballShadow,
                { width: ballSize - 8, height: ballSize - 8, borderRadius: ballSize / 2 },
              ]}
            />
            <Pokeball size={ballSize} open={open} />
          </Animated.View>
          <GrowingBall
            diameter={diameter}
            fillDiameter={ballFillDiameter(windowWidth, windowHeight)}
            opacity={growOpacity}
            translateX={growX}
            translateY={growY}
          />
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
    // Above the footer so the growing ball covers it too.
    zIndex: 20,
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
  },
  ballShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
