import type { PokemonDetail, PokemonSummary } from '../models';
import type { Page, PageRequest } from '../types';

export interface PokemonRepository {
  getPage(request: PageRequest, signal?: AbortSignal): Promise<Page<PokemonSummary>>;
  getById(idOrName: number | string, signal?: AbortSignal): Promise<PokemonDetail>;
}
