import { AppError, ErrorKind } from '@/domain/errors';
import type { PokemonDetail } from '@/domain/models';
import type { PokemonRepository } from '@/domain/ports';

export class GetPokemonDetail {
  constructor(private readonly repository: PokemonRepository) {}

  execute(idOrName: number | string, signal?: AbortSignal): Promise<PokemonDetail> {
    const key = typeof idOrName === 'string' ? idOrName.trim() : idOrName;

    if (key === '' || (typeof key === 'number' && (!Number.isInteger(key) || key < 1))) {
      throw new AppError(ErrorKind.Validation, `Invalid Pokémon identifier: ${idOrName}`);
    }
    return this.repository.getById(key, signal);
  }
}
