import { useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ConnectionBanner,
  CryIconButton,
  StatusMessage,
} from '@/presentation/components/molecules';
import {
  CatchCelebration,
  CatchPanel,
  PokemonDetailSkeleton,
  PokemonDetailView,
} from '@/presentation/components/organisms';
import { getErrorMessage } from '@/presentation/errors';
import { usePokemonCry, usePokemonDetail } from '@/presentation/hooks';
import { useCaught } from '@/presentation/providers/caught-provider';
import { typeColors, useTheme } from '@/presentation/theme';
import type { ViewHandle } from '@/presentation/types';
import { formatDexNumber, formatName } from '@/presentation/utils';

export default function PokemonDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const { pokemon, error, isLoading, isOffline, updatedAt, reload } = usePokemonDetail(id);
  const cry = usePokemonCry(pokemon, isOffline);
  const caught = useCaught();
  const { theme } = useTheme();
  const artworkRef = useRef<ViewHandle>(null);
  const [capture] = useState(() => new Animated.Value(0));
  const [grow] = useState(() => new Animated.Value(0));
  const [celebrate] = useState(() => new Animated.Value(0));
  const [celebration, setCelebration] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const insets = useSafeAreaInsets();
  // The hero takes the main type's color; light types (Electric, Ice…) need dark controls.
  const heroIsLight = !!pokemon?.types[0] && typeColors[pokemon.types[0]].text !== '#FFFFFF';
  // The compact bar keeps the type color too, so the tone holds while scrolling.
  const onLightHero = !!pokemon && heroIsLight;

  const title = pokemon ? formatName(pokemon.name) : formatDexNumber(id);

  return (
    <>
      <Stack.Screen
        options={{
          title,
          // Dark controls over light type colors, white over dark ones.
          headerTintColor: onLightHero ? theme.colors.textPrimary : theme.colors.onHeader,
          statusBarStyle: onLightHero ? 'dark' : 'light',
        }}
      />
      {pokemon ? (
        <>
          <ConnectionBanner visible={isOffline} updatedAt={updatedAt} />
          <PokemonDetailView
            pokemon={pokemon}
            isCaught={caught.ids.has(pokemon.id)}
            artworkRef={artworkRef}
            capture={capture}
            grow={grow}
            scrollEnabled={!isDragging}
            onNavigate={(next) =>
              router.replace({ pathname: '/pokemon/[id]', params: { id: String(next) } })
            }
            artworkOverlay={
              celebration ? <CatchCelebration progress={celebrate} label={celebration} /> : null
            }
            heroAction={
              cry.hasCry ? (
                <CryIconButton
                  status={cry.status}
                  unavailableOffline={cry.isUnavailableOffline}
                  onPress={cry.play}
                />
              ) : null
            }
            catchSlot={
              <CatchPanel
                pokemon={pokemon}
                isCaught={caught.ids.has(pokemon.id)}
                artworkRef={artworkRef}
                capture={capture}
                grow={grow}
                celebrate={celebrate}
                onCelebrate={setCelebration}
                onDragChange={setIsDragging}
                onCatch={caught.catchPokemon}
                onRelease={caught.release}
              />
            }
          />
        </>
      ) : isLoading ? (
        // The bar is transparent, so loading and error states start below it.
        <View style={{ flex: 1, paddingTop: insets.top + 54 }}>
          <PokemonDetailSkeleton />
        </View>
      ) : (
        <View style={{ flex: 1, paddingTop: insets.top + 54 }}>
          <StatusMessage
            icon={isOffline ? 'wifi-off' : 'alert'}
            title={isOffline ? "You're offline" : "Couldn't load this Pokémon"}
            message={error ? getErrorMessage(error) : 'Please try again.'}
            actionLabel="Try again"
            onAction={reload}
          />
        </View>
      )}
    </>
  );
}
