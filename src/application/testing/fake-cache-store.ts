import type { CacheEntry, CacheStore } from '@/domain/ports';

/** Map-backed CacheStore for the application tests, with a controllable clock. */
export class FakeCacheStore implements CacheStore {
  private readonly entries = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  get<T>(key: string): Promise<CacheEntry<T> | null> {
    return Promise.resolve((this.entries.get(key) as CacheEntry<T> | undefined) ?? null);
  }

  set<T>(key: string, value: T): Promise<void> {
    this.entries.set(key, { value, savedAt: this.now() });
    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    this.entries.delete(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.entries.clear();
    return Promise.resolve();
  }
}
