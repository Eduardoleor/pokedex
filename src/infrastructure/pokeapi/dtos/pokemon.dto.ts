import type { NamedApiResourceDto } from './common.dto';

export interface PokemonTypeSlotDto {
  slot: number;
  type: NamedApiResourceDto;
}

export interface PokemonAbilitySlotDto {
  slot: number;
  is_hidden: boolean;
  ability: NamedApiResourceDto;
}

export interface PokemonStatDto {
  base_stat: number;
  effort: number;
  stat: NamedApiResourceDto;
}

export interface PokemonSpritesDto {
  front_default: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

export interface PokemonCriesDto {
  latest: string | null;
  legacy: string | null;
}

export interface PokemonDto {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: PokemonTypeSlotDto[];
  abilities: PokemonAbilitySlotDto[];
  stats: PokemonStatDto[];
  sprites: PokemonSpritesDto;
  /** Missing in older API responses. */
  cries?: PokemonCriesDto;
}
