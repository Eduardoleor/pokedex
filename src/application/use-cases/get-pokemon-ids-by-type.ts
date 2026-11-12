import {
  cachedQuery,
  type CachePolicy,
  DEFAULT_CACHE_POLICY,
  type QueryOptions,
} from '@/application/cache';
import type { PokemonType } from '@/domain/enums';
import type { CacheStore, PokemonRepository } from '@/domain/ports';
import type { Cached } from '@/domain/types';

/** Which Pokémon share a type, saved like the rest of PokéAPI data so it works offline. */
export class GetPokemonIdsByType {
  constructor(
    private readonly repository: PokemonRepository,
    private readonly cache: CacheStore,
    private readonly policy: CachePolicy = DEFAULT_CACHE_POLICY,
  ) {}

  execute(type: PokemonType, options: QueryOptions = {}): Promise<Cached<number[]>> {
    return cachedQuery({
      ...options,
      key: `pokemon/type/${type}`,
      cache: this.cache,
      policy: this.policy,
      fetcher: (signal) => this.repository.getIdsByType(type, signal),
    });
  }
}
