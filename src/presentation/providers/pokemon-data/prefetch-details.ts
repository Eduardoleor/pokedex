import type { GetPokemonDetail } from '@/application/use-cases';
import { toAppError } from '@/domain/errors';

import { isOfflineError } from './is-offline-error';

const CONCURRENCY = 2;

/**
 * Saves the detail of each id so it opens instantly and works offline later.
 * Runs quietly: skips fresh entries, stops at the first connectivity error.
 */
export async function prefetchDetails(
  ids: number[],
  getPokemonDetail: GetPokemonDetail,
  signal: AbortSignal,
): Promise<void> {
  const queue = [...ids];
  let offline = false;

  async function worker(): Promise<void> {
    while (queue.length > 0 && !signal.aborted && !offline) {
      const id = queue.shift();
      if (id === undefined || (await getPokemonDetail.isCached(id))) {
        continue;
      }
      try {
        await getPokemonDetail.execute(id, { signal, forceRefresh: true });
      } catch (error) {
        offline = isOfflineError(toAppError(error));
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}
