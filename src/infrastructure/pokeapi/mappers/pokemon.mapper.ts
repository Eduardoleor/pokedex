import { isPokemonType, isStatName } from '@/domain/enums';
import { AppError, ErrorKind } from '@/domain/errors';
import type { PokemonDetail, PokemonStat, PokemonSummary } from '@/domain/models';
import type { Page, PageRequest } from '@/domain/types';

import { artworkUrl } from '../config';
import type { NamedApiResourceDto, PaginatedResponseDto, PokemonDto } from '../dtos';

/** PokéAPI reports height in decimeters and weight in hectograms. */
const DECI_TO_UNIT = 10;

export function extractId(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  const id = match?.[1] ? Number(match[1]) : NaN;

  if (!Number.isInteger(id)) {
    throw new AppError(ErrorKind.InvalidResponse, `Cannot read an id from "${url}"`);
  }
  return id;
}

export function toPokemonSummary(resource: NamedApiResourceDto): PokemonSummary {
  const id = extractId(resource.url);
  return { id, name: resource.name, imageUrl: artworkUrl(id) };
}

export function toPokemonPage(
  dto: PaginatedResponseDto<NamedApiResourceDto>,
  request: PageRequest,
): Page<PokemonSummary> {
  const nextOffset = request.offset + dto.results.length;
  return {
    items: dto.results.map(toPokemonSummary),
    total: dto.count,
    nextOffset: dto.next && nextOffset < dto.count ? nextOffset : null,
  };
}

export function toPokemonDetail(dto: PokemonDto): PokemonDetail {
  const stats = dto.stats.flatMap<PokemonStat>(({ stat, base_stat }) =>
    isStatName(stat.name) ? [{ name: stat.name, value: base_stat }] : [],
  );

  return {
    id: dto.id,
    name: dto.name,
    imageUrl: dto.sprites.other?.['official-artwork']?.front_default ?? artworkUrl(dto.id),
    types: [...dto.types]
      .sort((a, b) => a.slot - b.slot)
      .map(({ type }) => type.name)
      .filter(isPokemonType),
    abilities: [...dto.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map(({ ability, is_hidden }) => ({ name: ability.name, isHidden: is_hidden })),
    stats,
    height: dto.height / DECI_TO_UNIT,
    weight: dto.weight / DECI_TO_UNIT,
    baseExperience: dto.base_experience,
    // `latest` exists for every Pokémon; `legacy` is missing for newer generations.
    cryUrl: dto.cries?.latest ?? null,
  };
}
