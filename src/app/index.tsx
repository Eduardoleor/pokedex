import { useCallback } from 'react';

import { router, Stack } from 'expo-router';

import type { PokemonSummary } from '@/domain/models';
import { ConnectionBanner, StatusMessage, ThemeToggle } from '@/presentation/components/molecules';
import { PokemonGrid, PokemonGridSkeleton } from '@/presentation/components/organisms';
import { getErrorMessage } from '@/presentation/errors';
import { usePokemonList } from '@/presentation/hooks';
import { RequestStatus } from '@/presentation/types';

export default function PokemonListScreen() {
  const list = usePokemonList();

  const openDetail = useCallback((pokemon: PokemonSummary) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Pokédex', headerRight: () => <ThemeToggle /> }} />
      {list.isLoading && list.items.length === 0 ? (
        <PokemonGridSkeleton />
      ) : list.status === RequestStatus.Error && list.items.length === 0 ? (
        <StatusMessage
          icon={list.isOffline ? '⌁' : '⚠︎'}
          title={list.isOffline ? "You're offline" : 'Something went wrong'}
          message={list.error ? getErrorMessage(list.error) : 'Please try again.'}
          actionLabel="Try again"
          onAction={list.retry}
        />
      ) : list.status === RequestStatus.Success && list.items.length === 0 ? (
        <StatusMessage
          icon="∅"
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
    </>
  );
}
