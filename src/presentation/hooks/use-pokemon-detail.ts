import { useCallback, useEffect } from 'react';

import { usePokemonDetailsContext } from '@/presentation/providers/pokemon-data';
import { emptyDetailEntry } from '@/presentation/providers/pokemon-data/details-reducer';
import { RequestStatus } from '@/presentation/types';

export function usePokemonDetail(id: number) {
  const { details, loadDetail } = usePokemonDetailsContext();
  const entry = details[id] ?? emptyDetailEntry;
  const isIdle = entry.status === RequestStatus.Idle;

  useEffect(() => {
    if (isIdle) {
      loadDetail(id);
    }
  }, [id, isIdle, loadDetail]);

  useEffect(() => {
    // Only one silent attempt: a failed revalidation leaves `error` set.
    if (entry.isStale && !entry.error) {
      loadDetail(id, { silent: true });
    }
  }, [id, entry.isStale, entry.error, loadDetail]);

  const reload = useCallback(() => loadDetail(id), [id, loadDetail]);

  return {
    pokemon: entry.data,
    status: entry.status,
    error: entry.error,
    isLoading: entry.status === RequestStatus.Loading || isIdle,
    isOffline: entry.isOffline,
    updatedAt: entry.updatedAt,
    reload,
  };
}
