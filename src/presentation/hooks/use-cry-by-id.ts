import { useCallback, useEffect } from 'react';

import { useDependencies } from '@/di';

/** Plays a Pokémon's cry from its id, reading the saved detail to get the audio URL. */
export function useCryById() {
  const { getPokemonDetail, playPokemonCry } = useDependencies();

  useEffect(() => () => playPokemonCry.stop(), [playPokemonCry]);

  return useCallback(
    (id: number) => {
      getPokemonDetail
        .execute(id)
        .then(({ data }) => playPokemonCry.execute(data))
        // A missing cry is not worth interrupting the onboarding for.
        .catch(() => undefined);
    },
    [getPokemonDetail, playPokemonCry],
  );
}
