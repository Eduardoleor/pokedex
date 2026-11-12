import { useMemo } from 'react';

import {
  PAGE_SIZE,
  usePokemonDetailsContext,
  usePokemonListContext,
} from '../providers/pokemon-data';
import { RequestStatus } from '../types';
import { usePacedReveal } from './use-paced-reveal';

/** First page of Pokémon and how many of them are already saved for offline use. */
export function useOnboardingProgress() {
  const list = usePokemonListContext();
  const { savedIds } = usePokemonDetailsContext();

  const firstPage = useMemo(() => list.items.slice(0, PAGE_SIZE), [list.items]);
  const saved = useMemo(
    () => firstPage.filter((item) => savedIds.has(item.id)),
    [firstPage, savedIds],
  );
  // Already-saved Pokémon still show up one by one, so the screen never snaps into place.
  const ready = usePacedReveal(saved);
  const total = firstPage.length > 0 ? firstPage.length : PAGE_SIZE;

  return {
    ready,
    /** Saved already, including those the paced reveal has not shown yet. */
    savedCount: saved.length,
    total,
    isComplete: list.status === RequestStatus.Success && ready.length === firstPage.length,
    isOffline: list.isOffline || (list.status === RequestStatus.Error && firstPage.length === 0),
  };
}
