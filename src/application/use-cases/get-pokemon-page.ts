import {
  cachedQuery,
  type CachePolicy,
  DEFAULT_CACHE_POLICY,
  type QueryOptions,
} from '@/application/cache';
import { AppError, ErrorKind } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';
import type { CacheStore, PokemonRepository } from '@/domain/ports';
import type { Cached, Page, PageRequest } from '@/domain/types';

const MAX_PAGE_SIZE = 100;

export class GetPokemonPage {
  constructor(
    private readonly repository: PokemonRepository,
    private readonly cache: CacheStore,
    private readonly policy: CachePolicy = DEFAULT_CACHE_POLICY,
  ) {}

  execute(request: PageRequest, options: QueryOptions = {}): Promise<Cached<Page<PokemonSummary>>> {
    const { offset, limit } = request;

    if (!Number.isInteger(offset) || offset < 0) {
      throw new AppError(ErrorKind.Validation, `Invalid offset: ${offset}`);
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
      throw new AppError(ErrorKind.Validation, `Limit must be between 1 and ${MAX_PAGE_SIZE}`);
    }

    return cachedQuery({
      ...options,
      key: `pokemon/page/${offset}-${limit}`,
      cache: this.cache,
      policy: this.policy,
      fetcher: (signal) => this.repository.getPage(request, signal),
    });
  }
}
