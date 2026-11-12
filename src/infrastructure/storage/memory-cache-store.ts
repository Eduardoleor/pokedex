import type { CacheEntry, CacheStore } from '@/domain/ports';

/** In-memory implementation for tests and platforms without a file system. */
export class MemoryCacheStore implements CacheStore {
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
