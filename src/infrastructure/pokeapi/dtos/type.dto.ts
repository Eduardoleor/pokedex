import type { NamedApiResourceDto } from './common.dto';

export interface TypeDto {
  name: string;
  pokemon: { slot: number; pokemon: NamedApiResourceDto }[];
}
