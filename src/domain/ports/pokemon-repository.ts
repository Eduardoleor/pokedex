import type { PokemonType } from '@/domain/enums';
import type { PokemonDetail, PokemonSummary } from '@/domain/models';
import type { Page, PageRequest } from '@/domain/types';

export interface PokemonRepository {
  getPage(request: PageRequest, signal?: AbortSignal): Promise<Page<PokemonSummary>>;
  getById(idOrName: number | string, signal?: AbortSignal): Promise<PokemonDetail>;
  /** National Pokedex ids of every Pokémon with this type. */
  getIdsByType(type: PokemonType, signal?: AbortSignal): Promise<number[]>;
}
