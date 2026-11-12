import type { PokemonDetail, PokemonSummary } from '@/domain/models';
import type { PokemonRepository } from '@/domain/ports';
import type { Page, PageRequest } from '@/domain/types';

import type { HttpClient } from '../http';
import type { NamedApiResourceDto, PaginatedResponseDto, PokemonDto } from './dtos';
import { toPokemonDetail, toPokemonPage } from './mappers/pokemon.mapper';

export class PokeApiPokemonRepository implements PokemonRepository {
  constructor(private readonly http: HttpClient) {}

  async getPage(request: PageRequest, signal?: AbortSignal): Promise<Page<PokemonSummary>> {
    const { data } = await this.http.get<PaginatedResponseDto<NamedApiResourceDto>>('pokemon', {
      params: { offset: request.offset, limit: request.limit },
      signal,
    });
    return toPokemonPage(data, request);
  }

  async getById(idOrName: number | string, signal?: AbortSignal): Promise<PokemonDetail> {
    const key = encodeURIComponent(String(idOrName).toLowerCase());
    const { data } = await this.http.get<PokemonDto>(`pokemon/${key}`, { signal });
    return toPokemonDetail(data);
  }
}
