import { DataSource } from '@/domain/enums';
import { ErrorKind, toAppError } from '@/domain/errors';
import type { CacheStore } from '@/domain/ports';
import type { Cached } from '@/domain/types';

import { type CachePolicy, isFresh } from './cache-policy';

export interface QueryOptions {
  signal?: AbortSignal;
  /** Skip saved data and go to the network (pull to refresh, background revalidation). */
  forceRefresh?: boolean;
}

interface CachedQueryParams<T> extends QueryOptions {
  key: string;
  cache: CacheStore;
  policy: CachePolicy;
  fetcher: (signal?: AbortSignal) => Promise<T>;
}

/**
 * Stale-while-revalidate over a CacheStore:
 * - saved data is returned right away, flagged `isStale` once older than the TTL;
 * - otherwise the network is used and the result saved;
 * - if the network fails, saved data (of any age) is returned with the error attached.
 */
export async function cachedQuery<T>({
  key,
  cache,
  policy,
  fetcher,
  signal,
  forceRefresh = false,
}: CachedQueryParams<T>): Promise<Cached<T>> {
  const saved = await cache.get<T>(key).catch(() => null);

  if (saved && !forceRefresh) {
    return {
      data: saved.value,
      source: DataSource.Cache,
      updatedAt: saved.savedAt,
      isStale: !isFresh(saved.savedAt, policy),
      error: null,
    };
  }

  try {
    const data = await fetcher(signal);
    // A failed write must not break a successful request.
    await cache.set(key, data).catch(() => undefined);
    return {
      data,
      source: DataSource.Network,
      updatedAt: policy.now(),
      isStale: false,
      error: null,
    };
  } catch (error) {
    const appError = toAppError(error);
    if (!saved || appError.kind === ErrorKind.Cancelled) {
      throw appError;
    }
    return {
      data: saved.value,
      source: DataSource.Cache,
      updatedAt: saved.savedAt,
      isStale: !isFresh(saved.savedAt, policy),
      error: appError,
    };
  }
}
