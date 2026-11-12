import { usePokemonListContext } from '../providers/pokemon-data';

export function usePokemonList() {
  return usePokemonListContext();
}
