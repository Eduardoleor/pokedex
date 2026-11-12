import { useCallback, useEffect, useState } from 'react';

import { useDependencies } from '@/di';
import { type AppError, ErrorKind, toAppError } from '@/domain/errors';
import type { PokemonDetail } from '@/domain/models';
import type { CryStatus } from '@/presentation/types';

export function usePokemonCry(pokemon: PokemonDetail | undefined, isOffline: boolean) {
  const { playPokemonCry } = useDependencies();
  const [status, setStatus] = useState<CryStatus>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let active = true;
    if (pokemon?.cryUrl) {
      playPokemonCry
        .isSaved(pokemon)
        .then((saved) => active && setIsSaved(saved))
        .catch(() => undefined);
    }
    return () => {
      active = false;
      playPokemonCry.stop();
    };
  }, [playPokemonCry, pokemon]);

  const play = useCallback(() => {
    if (!pokemon) {
      return;
    }
    setError(null);
    setStatus('loading');
    playPokemonCry
      .execute(pokemon, {
        onStart: () => {
          setIsSaved(true);
          setStatus('playing');
        },
      })
      .then(() => setStatus('idle'))
      .catch((cause: unknown) => {
        const appError = toAppError(cause);
        setError(appError);
        setStatus(appError.kind === ErrorKind.Cancelled ? 'idle' : 'error');
      });
  }, [playPokemonCry, pokemon]);

  const hasCry = Boolean(pokemon?.cryUrl);

  return {
    play,
    status,
    error,
    hasCry,
    /** Offline and never downloaded: there is nothing to play yet. */
    isUnavailableOffline: hasCry && isOffline && !isSaved,
  };
}
