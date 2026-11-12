import type { CacheStore, MediaCache } from '@/domain/ports';

/** Forgets every Pokémon and cry saved for offline use; preferences are kept. */
export class ClearSyncedData {
  constructor(
    private readonly pokemonCache: CacheStore,
    private readonly mediaCache: MediaCache,
  ) {}

  async execute(): Promise<void> {
    await Promise.all([this.pokemonCache.clear(), this.mediaCache.clear()]);
  }
}
