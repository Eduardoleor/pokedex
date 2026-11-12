import { useCallback, useEffect, useRef, useState } from 'react';

interface AutoplayOptions {
  intervalMs: number;
  /** After a user interaction, autoplay waits this long before resuming. */
  resumeAfterMs?: number;
}

/** Cycles an index through `count` items; user interaction pauses it for a while. */
export function useAutoplay(count: number, { intervalMs, resumeAfterMs = 5000 }: AutoplayOptions) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const pause = useCallback(() => {
    setIsPaused(true);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setIsPaused(false), resumeAfterMs);
  }, [resumeAfterMs]);

  /** Selection made by the user: moves there and pauses autoplay. */
  const select = useCallback(
    (next: number) => {
      setIndex(next);
      pause();
    },
    [pause],
  );

  useEffect(() => {
    if (isPaused || count < 2) {
      return undefined;
    }
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, count, intervalMs]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  return {
    index: count === 0 ? 0 : Math.min(index, count - 1),
    isPaused,
    /** Programmatic move that does not pause autoplay. */
    goTo: setIndex,
    select,
    pause,
  };
}
