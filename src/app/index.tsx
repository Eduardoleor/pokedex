import { useCallback } from 'react';

import { Redirect, router, Stack } from 'expo-router';

import type { PokemonSummary } from '@/domain/models';
import { IconButton } from '@/presentation/components/atoms';
import { ConnectionBanner, StatusMessage, ThemeToggle } from '@/presentation/components/molecules';
import {
  PokeballReveal,
  PokemonGrid,
  PokemonGridSkeleton,
} from '@/presentation/components/organisms';
import { getErrorMessage } from '@/presentation/errors';
import { usePokemonList } from '@/presentation/hooks';
import { useOnboarding } from '@/presentation/providers/onboarding-provider';
import { OnboardingPreview, OnboardingStatus, RequestStatus } from '@/presentation/types';

export default function PokemonListScreen() {
  const list = usePokemonList();
  const onboarding = useOnboarding();

  const openDetail = useCallback((pokemon: PokemonSummary) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
  }, []);

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
          title: 'Pokédex',
          // The opening ball covers the whole screen, header included.
          headerShown: !onboarding.isRevealPending,
          headerRight: () => <ThemeToggle />,
          headerLeft: __DEV__ ? () => <OnboardingPreviewButton /> : undefined,
        }}
      />
      {list.isLoading && list.items.length === 0 ? (
        <PokemonGridSkeleton />
      ) : list.status === RequestStatus.Error && list.items.length === 0 ? (
        <StatusMessage
          icon={list.isOffline ? 'wifi-off' : 'alert'}
          title={list.isOffline ? "You're offline" : 'Something went wrong'}
          message={list.error ? getErrorMessage(list.error) : 'Please try again.'}
          actionLabel="Try again"
          onAction={list.retry}
        />
      ) : list.status === RequestStatus.Success && list.items.length === 0 ? (
        <StatusMessage
          icon="search"
          title="No Pokémon yet"
          message="Pull down to refresh the list."
          actionLabel="Refresh"
          onAction={list.refresh}
        />
      ) : (
        <PokemonGrid
          items={list.items}
          hasMore={list.hasMore}
          isLoadingMore={list.isLoadingMore}
          isRefreshing={list.isRefreshing}
          error={list.error}
          onEndReached={list.loadMore}
          onRefresh={list.refresh}
          onRetry={list.retry}
          onSelect={openDetail}
          ListHeaderComponent={
            <ConnectionBanner visible={list.isOffline} updatedAt={list.updatedAt} />
          }
        />
      )}
      {onboarding.isRevealPending ? <PokeballReveal onDone={onboarding.finishReveal} /> : null}
    </>
  );
}

/** Development only: replays the onboarding without touching saved data. */
function OnboardingPreviewButton() {
  const open = (preview: OnboardingPreview) =>
    router.push({ pathname: '/onboarding', params: { preview } });

  return (
    <IconButton
      icon="pokeball"
      accessibilityLabel="Preview onboarding"
      accessibilityHint="Long press to preview it offline"
      onPress={() => open(OnboardingPreview.Loading)}
      onLongPress={() => open(OnboardingPreview.Offline)}
    />
  );
}
