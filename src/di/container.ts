import { Platform } from 'react-native';

import { GetPokemonDetail, GetPokemonPage } from '@/application/use-cases';
import type { CacheStore } from '@/domain/ports';
import { FetchHttpClient } from '@/infrastructure/http';
import { POKEAPI_BASE_URL, PokeApiPokemonRepository } from '@/infrastructure/pokeapi';
import { FileSystemCacheStore, MemoryCacheStore } from '@/infrastructure/storage';

export interface Dependencies {
  getPokemonPage: GetPokemonPage;
  getPokemonDetail: GetPokemonDetail;
  preferences: CacheStore;
}

/** Composition root: the only place that knows which adapter backs each port. */
export function createDependencies(): Dependencies {
  const http = new FetchHttpClient({ baseUrl: POKEAPI_BASE_URL });
  const pokemonRepository = new PokeApiPokemonRepository(http);
  const isNative = Platform.OS !== 'web';
  const pokemonCache = isNative ? new FileSystemCacheStore('pokeapi') : new MemoryCacheStore();
  const preferences = isNative ? new FileSystemCacheStore('preferences') : new MemoryCacheStore();

  return {
    getPokemonPage: new GetPokemonPage(pokemonRepository, pokemonCache),
    getPokemonDetail: new GetPokemonDetail(pokemonRepository, pokemonCache),
    preferences,
  };
}
