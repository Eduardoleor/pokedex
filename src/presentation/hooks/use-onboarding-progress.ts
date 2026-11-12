import { useMemo } from 'react';

import {
  PAGE_SIZE,
  usePokemonDetailsContext,
  usePokemonListContext,
} from '../providers/pokemon-data';
import { RequestStatus } from '../types';

/** First page of Pokémon and how many of them are already saved for offline use. */
export function useOnboardingProgress() {
  const list = usePokemonListContext();
  const { savedIds } = usePokemonDetailsContext();

  const firstPage = useMemo(() => list.items.slice(0, PAGE_SIZE), [list.items]);
  const ready = useMemo(
    () => firstPage.filter((item) => savedIds.has(item.id)),
    [firstPage, savedIds],
  );
  const total = firstPage.length > 0 ? firstPage.length : PAGE_SIZE;

  return {
    ready,
    total,
    isComplete: list.status === RequestStatus.Success && ready.length === firstPage.length,
    isOffline: list.isOffline || (list.status === RequestStatus.Error && firstPage.length === 0),
  };
}
