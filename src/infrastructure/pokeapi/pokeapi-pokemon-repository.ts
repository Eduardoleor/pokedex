import type { PokemonType } from '@/domain/enums';
import type { PokemonDetail, PokemonSummary } from '@/domain/models';
import type { PokemonRepository } from '@/domain/ports';
import type { Page, PageRequest } from '@/domain/types';
import type { HttpClient } from '@/infrastructure/http';
import type {
  NamedApiResourceDto,
  PaginatedResponseDto,
  PokemonDto,
  TypeDto,
} from '@/infrastructure/pokeapi/dtos';
import {
  extractId,
  toPokemonDetail,
  toPokemonPage,
} from '@/infrastructure/pokeapi/mappers/pokemon.mapper';

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

  async getIdsByType(type: PokemonType, signal?: AbortSignal): Promise<number[]> {
    const { data } = await this.http.get<TypeDto>(`type/${type}`, { signal });
    return data.pokemon.map((entry) => extractId(entry.pokemon.url));
  }
}
