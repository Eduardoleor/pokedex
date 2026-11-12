import { FakeCacheStore } from '@/application/testing/fake-cache-store';
import { DataSource } from '@/domain/enums';
import { AppError, ErrorKind } from '@/domain/errors';

import type { CachePolicy } from './cache-policy';
import { cachedQuery } from './cached-query';

const DAY = 24 * 60 * 60 * 1000;

function setup() {
  let now = 1_000_000;
  const policy: CachePolicy = { ttlMs: 5 * DAY, now: () => now };
  const cache = new FakeCacheStore(() => now);
  return {
    cache,
    policy,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

describe('cachedQuery', () => {
  it('fetches from the network and saves the result when nothing is saved', async () => {
    const { cache, policy } = setup();
    const fetcher = jest.fn().mockResolvedValue('fresh');

    const result = await cachedQuery({ key: 'k', cache, policy, fetcher });

    expect(result).toMatchObject({ data: 'fresh', source: DataSource.Network, isStale: false });
    expect((await cache.get('k'))?.value).toBe('fresh');
  });

  it('serves a fresh saved copy without touching the network', async () => {
    const { cache, policy, advance } = setup();
    await cache.set('k', 'saved');
    advance(DAY);
    const fetcher = jest.fn();

    const result = await cachedQuery({ key: 'k', cache, policy, fetcher });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result).toMatchObject({ data: 'saved', source: DataSource.Cache, isStale: false });
  });

  it('flags a copy older than the TTL as stale but still serves it', async () => {
    const { cache, policy, advance } = setup();
    await cache.set('k', 'saved');
    advance(6 * DAY);

    const result = await cachedQuery({ key: 'k', cache, policy, fetcher: jest.fn() });

    expect(result).toMatchObject({ data: 'saved', isStale: true });
  });

  it('skips the saved copy when the refresh is forced', async () => {
    const { cache, policy } = setup();
    await cache.set('k', 'saved');
    const fetcher = jest.fn().mockResolvedValue('fresh');

    const result = await cachedQuery({ key: 'k', cache, policy, fetcher, forceRefresh: true });

    expect(result.data).toBe('fresh');
    expect((await cache.get('k'))?.value).toBe('fresh');
  });

  it('falls back to the saved copy, with the error attached, when the network fails', async () => {
    const { cache, policy } = setup();
    await cache.set('k', 'saved');
    const error = new AppError(ErrorKind.Network, 'offline');

    const result = await cachedQuery({
      key: 'k',
      cache,
      policy,
      forceRefresh: true,
      fetcher: jest.fn().mockRejectedValue(error),
    });

    expect(result).toMatchObject({ data: 'saved', source: DataSource.Cache, error });
  });

  it('throws when the network fails and nothing is saved', async () => {
    const { cache, policy } = setup();
    const fetcher = jest.fn().mockRejectedValue(new AppError(ErrorKind.Timeout, 'slow'));

    await expect(cachedQuery({ key: 'k', cache, policy, fetcher })).rejects.toMatchObject({
      kind: ErrorKind.Timeout,
    });
  });

  it('never hides a cancellation behind saved data', async () => {
    const { cache, policy } = setup();
    await cache.set('k', 'saved');
    const fetcher = jest.fn().mockRejectedValue(new AppError(ErrorKind.Cancelled, 'aborted'));

    await expect(
      cachedQuery({ key: 'k', cache, policy, fetcher, forceRefresh: true }),
    ).rejects.toMatchObject({ kind: ErrorKind.Cancelled });
  });

  it('still returns the data when saving it fails', async () => {
    const { cache, policy } = setup();
    jest.spyOn(cache, 'set').mockRejectedValue(new Error('disk full'));

    const result = await cachedQuery({
      key: 'k',
      cache,
      policy,
      fetcher: jest.fn().mockResolvedValue('fresh'),
    });

    expect(result.data).toBe('fresh');
  });
});
