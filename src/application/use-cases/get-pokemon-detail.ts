import { AppError, ErrorKind } from '@/domain/errors';
import type { PokemonDetail } from '@/domain/models';
import type { CacheStore, PokemonRepository } from '@/domain/ports';
import type { Cached } from '@/domain/types';

import {
  cachedQuery,
  type CachePolicy,
  DEFAULT_CACHE_POLICY,
  isFresh,
  type QueryOptions,
} from '../cache';

export class GetPokemonDetail {
  constructor(
    private readonly repository: PokemonRepository,
    private readonly cache: CacheStore,
    private readonly policy: CachePolicy = DEFAULT_CACHE_POLICY,
  ) {}

  execute(id: number, options: QueryOptions = {}): Promise<Cached<PokemonDetail>> {
    if (!Number.isInteger(id) || id < 1) {
      throw new AppError(ErrorKind.Validation, `Invalid Pokémon id: ${id}`);
    }

    return cachedQuery({
      ...options,
      key: `pokemon/detail/${id}`,
      cache: this.cache,
      policy: this.policy,
      fetcher: (signal) => this.repository.getById(id, signal),
    });
  }

  /** True when a fresh copy is already saved, so prefetching can skip it. */
  async isCached(id: number): Promise<boolean> {
    const saved = await this.cache.get<PokemonDetail>(`pokemon/detail/${id}`).catch(() => null);
    return saved !== null && isFresh(saved.savedAt, this.policy);
  }
}
