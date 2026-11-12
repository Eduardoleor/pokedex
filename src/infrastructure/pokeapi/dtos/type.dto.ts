import type { NamedApiResourceDto } from '@/infrastructure/pokeapi/dtos/common.dto';

export interface TypeDto {
  name: string;
  pokemon: { slot: number; pokemon: NamedApiResourceDto }[];
}
