import { useCallback } from 'react';

import { router } from 'expo-router';

import type { PokemonSummary } from '@/domain/models';
import { StatusMessage } from '@/presentation/components/molecules';
import { PokemonBrowser } from '@/presentation/components/organisms';
import { useCaught } from '@/presentation/providers/caught-provider';

export default function CaughtScreen() {
  const caught = useCaught();

  const openDetail = useCallback((pokemon: PokemonSummary) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
  }, []);

  return (
    <PokemonBrowser
      items={caught.items}
      caughtIds={caught.ids}
      onSelect={openDetail}
      empty={
        <StatusMessage
          icon="pokeball"
          title="Nothing caught yet"
          message="Open any Pokémon and throw a Poké Ball to catch it."
          actionLabel="Browse the Pokedex"
          onAction={() => router.back()}
        />
      }
    />
  );
}
