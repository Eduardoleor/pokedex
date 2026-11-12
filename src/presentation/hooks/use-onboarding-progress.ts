import { useEffect, useMemo, useState } from 'react';

import {
  PAGE_SIZE,
  usePokemonDetailsContext,
  usePokemonListContext,
} from '../providers/pokemon-data';
import { OnboardingPreview, RequestStatus } from '../types';

const PREVIEW_STEP_MS = 400;

/**
 * First page of Pokémon and how many of them are already saved for offline use.
 * With a `preview`, progress is simulated from the loaded list instead.
 */
export function useOnboardingProgress(preview?: OnboardingPreview) {
  const list = usePokemonListContext();
  const { savedIds } = usePokemonDetailsContext();
  const [previewCount, setPreviewCount] = useState(0);

  const firstPage = useMemo(() => list.items.slice(0, PAGE_SIZE), [list.items]);
  const ready = useMemo(
    () => firstPage.filter((item) => savedIds.has(item.id)),
    [firstPage, savedIds],
  );
  const total = firstPage.length > 0 ? firstPage.length : PAGE_SIZE;
  const previewDone = previewCount >= firstPage.length && firstPage.length > 0;

  useEffect(() => {
    if (preview !== OnboardingPreview.Loading || previewDone) {
      return undefined;
    }
    const timer = setInterval(() => setPreviewCount((count) => count + 1), PREVIEW_STEP_MS);
    return () => clearInterval(timer);
  }, [preview, previewDone]);

  if (preview === OnboardingPreview.Loading) {
    return {
      ready: firstPage.slice(0, previewCount),
      total,
      isComplete: previewDone,
      isOffline: false,
    };
  }
  if (preview === OnboardingPreview.Offline) {
    return { ready: [], total: PAGE_SIZE, isComplete: false, isOffline: true };
  }

  return {
    ready,
    total,
    isComplete: list.status === RequestStatus.Success && ready.length === firstPage.length,
    isOffline: list.isOffline || (list.status === RequestStatus.Error && firstPage.length === 0),
  };
}
