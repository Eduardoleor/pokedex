import { Directory, File, Paths } from 'expo-file-system';

import type { CacheEntry, CacheStore } from '@/domain/ports';

/** Bump when the shape of saved data changes; old files are ignored and removed. */
const CACHE_VERSION = 1;

function isCacheEntry(value: unknown): value is CacheEntry<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'savedAt' in value &&
    typeof value.savedAt === 'number' &&
    'value' in value
  );
}

/**
 * One JSON file per key under the documents directory, which the OS does not purge
 * (unlike the cache directory), so saved data survives until the app removes it.
 */
export class FileSystemCacheStore implements CacheStore {
  private readonly directory: Directory;

  constructor(
    namespace = 'cache',
    private readonly now: () => number = () => Date.now(),
  ) {
    this.directory = new Directory(Paths.document, `${namespace}-v${CACHE_VERSION}`);
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const file = this.fileFor(key);
    if (!file.exists) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (isCacheEntry(parsed)) {
        return parsed as CacheEntry<T>;
      }
    } catch {
      // Corrupted or partially written file: treat it as a miss.
    }
    file.delete();
    return null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!this.directory.exists) {
      this.directory.create({ intermediates: true, idempotent: true });
    }
    const entry: CacheEntry<T> = { value, savedAt: this.now() };
    await this.fileFor(key).write(JSON.stringify(entry));
  }

  remove(key: string): Promise<void> {
    const file = this.fileFor(key);
    if (file.exists) {
      file.delete();
    }
    return Promise.resolve();
  }

  clear(): Promise<void> {
    if (this.directory.exists) {
      this.directory.delete();
    }
    return Promise.resolve();
  }

  private fileFor(key: string): File {
    return new File(this.directory, `${encodeURIComponent(key)}.json`);
  }
}
