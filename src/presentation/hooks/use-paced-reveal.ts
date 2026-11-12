import { useEffect, useMemo, useState } from 'react';

import { useReduceMotion } from './use-reduce-motion';

interface PacedRevealOptions {
  /** Pause between one item showing up and the next. */
  intervalMs?: number;
  /** Pause before the first item, so the screen settles before anything moves. */
  startDelayMs?: number;
}

/**
 * Reveals `items` one at a time. Data that is already available (a warm cache, a fast
 * connection) would otherwise pop in all at once and make the animation feel abrupt.
 * Skipped when the user asked for reduced motion.
 */
export function usePacedReveal<T>(
  items: readonly T[],
  { intervalMs = 260, startDelayMs = 450 }: PacedRevealOptions = {},
): T[] {
  const reduceMotion = useReduceMotion();
  const [count, setCount] = useState(0);
  const target = items.length;

  useEffect(() => {
    if (reduceMotion || count >= target) {
      return undefined;
    }
    const timer = setTimeout(
      () => setCount((current) => Math.min(current + 1, target)),
      count === 0 ? startDelayMs : intervalMs,
    );
    return () => clearTimeout(timer);
  }, [count, intervalMs, reduceMotion, startDelayMs, target]);

  return useMemo(
    () => (reduceMotion ? [...items] : items.slice(0, Math.min(count, target))),
    [count, items, reduceMotion, target],
  );
}
