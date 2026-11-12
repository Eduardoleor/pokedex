import { useRef, useState } from 'react';
import { Animated } from 'react-native';

import { Stack, useLocalSearchParams } from 'expo-router';

import { ConnectionBanner, CryButton, StatusMessage } from '@/presentation/components/molecules';
import {
  CatchPanel,
  PokemonDetailSkeleton,
  PokemonDetailView,
} from '@/presentation/components/organisms';
import { getErrorMessage } from '@/presentation/errors';
import { usePokemonCry, usePokemonDetail } from '@/presentation/hooks';
import { useCaught } from '@/presentation/providers/caught-provider';
import type { ViewHandle } from '@/presentation/types';
import { formatDexNumber, formatName } from '@/presentation/utils';

export default function PokemonDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const { pokemon, error, isLoading, isOffline, updatedAt, reload } = usePokemonDetail(id);
  const cry = usePokemonCry(pokemon, isOffline);
  const caught = useCaught();
  const artworkRef = useRef<ViewHandle>(null);
  const [capture] = useState(() => new Animated.Value(0));

  const title = pokemon ? formatName(pokemon.name) : formatDexNumber(id);

  return (
    <>
      <Stack.Screen options={{ title }} />
      {pokemon ? (
        <>
          <ConnectionBanner visible={isOffline} updatedAt={updatedAt} />
          <PokemonDetailView
            pokemon={pokemon}
            artworkRef={artworkRef}
            capture={capture}
            catchSlot={
              <CatchPanel
                pokemon={pokemon}
                isCaught={caught.ids.has(pokemon.id)}
                artworkRef={artworkRef}
                capture={capture}
                onCatch={caught.catchPokemon}
                onRelease={caught.release}
              />
            }
            actions={
              cry.hasCry ? (
                <CryButton
                  status={cry.status}
                  unavailableOffline={cry.isUnavailableOffline}
                  onPress={cry.play}
                />
              ) : null
            }
          />
        </>
      ) : isLoading ? (
        <PokemonDetailSkeleton />
      ) : (
        <StatusMessage
          icon={isOffline ? 'wifi-off' : 'alert'}
          title={isOffline ? "You're offline" : "Couldn't load this Pokémon"}
          message={error ? getErrorMessage(error) : 'Please try again.'}
          actionLabel="Try again"
          onAction={reload}
        />
      )}
    </>
  );
}
