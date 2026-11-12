export interface CacheEntry<T> {
  value: T;
  /** Epoch milliseconds. */
  savedAt: number;
}

export interface CacheStore {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
