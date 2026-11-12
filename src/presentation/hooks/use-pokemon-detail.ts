import { useCallback } from 'react';

import { useDependencies } from '@/di';

import { useAsyncTask } from './use-async-task';

export function usePokemonDetail(idOrName: number | string | undefined) {
  const { getPokemonDetail } = useDependencies();

  const task = useCallback(
    (signal: AbortSignal) => getPokemonDetail.execute(idOrName ?? '', signal),
    [getPokemonDetail, idOrName],
  );

  const { data, ...rest } = useAsyncTask(idOrName === undefined ? null : task);
  return { pokemon: data, ...rest };
}
