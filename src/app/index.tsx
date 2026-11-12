import { useCallback } from 'react';

import { Redirect, router, Stack, useIsFocused } from 'expo-router';

import type { PokemonSummary } from '@/domain/models';
import {
  ConnectionBanner,
  HomeHeader,
  PokeballHeaderButton,
  ProfileHeaderButton,
  StatusMessage,
} from '@/presentation/components/molecules';
import {
  PokeballReveal,
  PokemonBrowser,
  PokemonGridSkeleton,
} from '@/presentation/components/organisms';
import { getErrorMessage } from '@/presentation/errors';
import { usePokemonList } from '@/presentation/hooks';
import { useCaught } from '@/presentation/providers/caught-provider';
import { useOnboarding } from '@/presentation/providers/onboarding-provider';
import { OnboardingStatus, RequestStatus } from '@/presentation/types';

export default function PokemonListScreen() {
  const list = usePokemonList();
  const onboarding = useOnboarding();
  const caught = useCaught();
  const isFocused = useIsFocused();

  const openDetail = useCallback((pokemon: PokemonSummary) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
  }, []);

  const pokeballButton = (
    <PokeballHeaderButton
      count={caught.items.length}
      // Waits until the home is on screen (after the opening ball or coming back
      // from a catch in the detail) so the shake is actually seen.
      celebrate={caught.hasNewCatch && isFocused && !onboarding.isRevealPending}
      onCelebrated={caught.acknowledgeCatch}
      onPress={() => router.push('/caught')}
    />
  );
  const showsSkeleton = list.isLoading && list.items.length === 0;
  const profileButton = <ProfileHeaderButton onPress={() => router.push('/profile')} />;

  if (onboarding.status === OnboardingStatus.Loading) {
    return null;
  }
  if (onboarding.status === OnboardingStatus.Pending) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Pokedex',
          // Drawn by HomeHeader below instead of the native bar.
          headerShown: false,
        }}
      />
      {/* The opening ball covers the whole screen, header included. */}
      {onboarding.isRevealPending ? null : (
        <HomeHeader left={pokeballButton} title="Pokedex" right={profileButton} />
      )}
      {showsSkeleton ? (
        <PokemonGridSkeleton />
      ) : list.status === RequestStatus.Error && list.items.length === 0 ? (
        <StatusMessage
          icon={list.isOffline ? 'wifi-off' : 'alert'}
          title={list.isOffline ? "You're offline" : 'Something went wrong'}
          message={list.error ? getErrorMessage(list.error) : 'Please try again.'}
          actionLabel="Try again"
          onAction={list.retry}
        />
      ) : (
        <PokemonBrowser
          items={list.items}
          caughtIds={caught.ids}
          onSelect={openDetail}
          banner={<ConnectionBanner visible={list.isOffline} updatedAt={list.updatedAt} />}
          hasMore={list.hasMore}
          isLoadingMore={list.isLoadingMore}
          isRefreshing={list.isRefreshing}
          error={list.error}
          onEndReached={list.loadMore}
          onRefresh={list.refresh}
          onRetry={list.retry}
          empty={
            <StatusMessage
              icon="search"
              title="No Pokémon yet"
              message="Pull down to refresh the list."
              actionLabel="Refresh"
              onAction={list.refresh}
            />
          }
        />
      )}
      {onboarding.isRevealPending ? (
        <PokeballReveal
          ready={list.items.length > 0 || !list.isLoading}
          onDone={onboarding.finishReveal}
        />
      ) : null}
    </>
  );
}
