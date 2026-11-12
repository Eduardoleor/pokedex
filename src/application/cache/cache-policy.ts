const DAY_MS = 24 * 60 * 60 * 1000;

export interface CachePolicy {
  /** How long saved data is considered fresh. */
  ttlMs: number;
  now: () => number;
}

export const DEFAULT_CACHE_POLICY: CachePolicy = {
  ttlMs: 5 * DAY_MS,
  now: () => Date.now(),
};

export function isFresh(savedAt: number, policy: CachePolicy): boolean {
  return policy.now() - savedAt < policy.ttlMs;
}
