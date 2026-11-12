import { AppError, ErrorKind } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';
import type { PokemonRepository } from '@/domain/ports';
import type { Page, PageRequest } from '@/domain/types';

const MAX_PAGE_SIZE = 100;

export class GetPokemonPage {
  constructor(private readonly repository: PokemonRepository) {}

  execute(request: PageRequest, signal?: AbortSignal): Promise<Page<PokemonSummary>> {
    const { offset, limit } = request;

    if (!Number.isInteger(offset) || offset < 0) {
      throw new AppError(ErrorKind.Validation, `Invalid offset: ${offset}`);
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
      throw new AppError(ErrorKind.Validation, `Limit must be between 1 and ${MAX_PAGE_SIZE}`);
    }
    return this.repository.getPage(request, signal);
  }
}
