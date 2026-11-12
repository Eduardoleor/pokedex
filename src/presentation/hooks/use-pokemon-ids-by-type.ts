import { useEffect, useState } from 'react';

import { useDependencies } from '@/di';
import type { PokemonType } from '@/domain/enums';
import type { AppError } from '@/domain/errors';
import { toAppError } from '@/domain/errors';

interface TypeIdsState {
  type: PokemonType | null;
  ids: ReadonlySet<number> | null;
  error: AppError | null;
}

/** The ids of every Pokémon with `type`; `null` ids while loading or with no type picked. */
export function usePokemonIdsByType(type: PokemonType | null) {
  const { getPokemonIdsByType } = useDependencies();
  const [state, setState] = useState<TypeIdsState>({ type: null, ids: null, error: null });

  useEffect(() => {
    if (!type) {
      return;
    }
    const controller = new AbortController();
    getPokemonIdsByType
      .execute(type, { signal: controller.signal })
      .then(({ data }) => setState({ type, ids: new Set(data), error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ type, ids: null, error: toAppError(error) });
        }
      });
    return () => controller.abort();
  }, [getPokemonIdsByType, type]);

  // Results of a previous type never leak into the current one.
  const current = state.type === type ? state : null;
  return {
    ids: type ? (current?.ids ?? null) : null,
    error: current?.error ?? null,
    isLoading: type !== null && !current,
  };
}
