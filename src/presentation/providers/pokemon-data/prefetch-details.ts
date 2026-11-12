import { Image } from 'expo-image';

import type { GetPokemonDetail } from '@/application/use-cases';
import { toAppError } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';
import { isOfflineError } from '@/presentation/providers/pokemon-data/is-offline-error';

const CONCURRENCY = 2;

/**
 * Saves the detail and artwork of each Pokémon so they open instantly and work offline.
 * Runs quietly: fresh entries are only reported, and it stops at the first connectivity error.
 */
export async function prefetchDetails(
  items: PokemonSummary[],
  getPokemonDetail: GetPokemonDetail,
  signal: AbortSignal,
  onSaved: (id: number) => void,
): Promise<void> {
  const queue = [...items];
  let offline = false;

  async function worker(): Promise<void> {
    while (queue.length > 0 && !signal.aborted && !offline) {
      const item = queue.shift();
      if (!item) {
        continue;
      }
      try {
        if (!(await getPokemonDetail.isCached(item.id))) {
          await getPokemonDetail.execute(item.id, { signal, forceRefresh: true });
        }
        await Image.prefetch(item.imageUrl, 'disk');
        if (!signal.aborted) {
          onSaved(item.id);
        }
      } catch (error) {
        offline = isOfflineError(toAppError(error));
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}
