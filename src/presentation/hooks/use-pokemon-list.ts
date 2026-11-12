import { usePokemonListContext } from '@/presentation/providers/pokemon-data';

export function usePokemonList() {
  return usePokemonListContext();
}
