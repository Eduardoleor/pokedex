import { Platform } from 'react-native';

import { GetPokemonDetail, GetPokemonPage, PlayPokemonCry } from '@/application/use-cases';
import type { CacheStore } from '@/domain/ports';
import { AudioApiSoundPlayer } from '@/infrastructure/audio';
import { FetchHttpClient } from '@/infrastructure/http';
import { POKEAPI_BASE_URL, PokeApiPokemonRepository } from '@/infrastructure/pokeapi';
import {
  FileSystemCacheStore,
  FileSystemMediaCache,
  MemoryCacheStore,
  RemoteMediaCache,
} from '@/infrastructure/storage';

export interface Dependencies {
  getPokemonPage: GetPokemonPage;
  getPokemonDetail: GetPokemonDetail;
  playPokemonCry: PlayPokemonCry;
  preferences: CacheStore;
}

/** Composition root: the only place that knows which adapter backs each port. */
export function createDependencies(): Dependencies {
  const http = new FetchHttpClient({ baseUrl: POKEAPI_BASE_URL });
  const pokemonRepository = new PokeApiPokemonRepository(http);
  const isNative = Platform.OS !== 'web';
  const pokemonCache = isNative ? new FileSystemCacheStore('pokeapi') : new MemoryCacheStore();
  const preferences = isNative ? new FileSystemCacheStore('preferences') : new MemoryCacheStore();
  const mediaCache = isNative ? new FileSystemMediaCache('cries') : new RemoteMediaCache();

  return {
    getPokemonPage: new GetPokemonPage(pokemonRepository, pokemonCache),
    getPokemonDetail: new GetPokemonDetail(pokemonRepository, pokemonCache),
    playPokemonCry: new PlayPokemonCry(mediaCache, new AudioApiSoundPlayer()),
    preferences,
  };
}
