import { GetPokemonDetail, GetPokemonPage } from '@/application/use-cases';
import { FetchHttpClient } from '@/infrastructure/http';
import { POKEAPI_BASE_URL, PokeApiPokemonRepository } from '@/infrastructure/pokeapi';

export interface Dependencies {
  getPokemonPage: GetPokemonPage;
  getPokemonDetail: GetPokemonDetail;
}

/** Composition root: the only place that knows which adapter backs each port. */
export function createDependencies(): Dependencies {
  const http = new FetchHttpClient({ baseUrl: POKEAPI_BASE_URL });
  const pokemonRepository = new PokeApiPokemonRepository(http);

  return {
    getPokemonPage: new GetPokemonPage(pokemonRepository),
    getPokemonDetail: new GetPokemonDetail(pokemonRepository),
  };
}
