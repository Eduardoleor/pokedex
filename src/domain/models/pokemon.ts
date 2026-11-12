import type { PokemonType, StatName } from '../enums';

export interface PokemonSummary {
  id: number;
  name: string;
  imageUrl: string;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonStat {
  name: StatName;
  value: number;
}

export interface PokemonDetail extends PokemonSummary {
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  /** Meters */
  height: number;
  /** Kilograms */
  weight: number;
  baseExperience: number | null;
}
