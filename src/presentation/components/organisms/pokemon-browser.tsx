import { type ReactElement, useCallback, useDeferredValue, useMemo, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import type { AppError } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';

import { useTheme } from '../../theme';
import { matchesPokemon, normalizeSearch } from '../../utils';
import { Pokeball, Spinner, Text } from '../atoms';
import { SearchField, StatusMessage } from '../molecules';
import { PokemonGrid } from './pokemon-grid';

export interface PokemonBrowserProps {
  items: PokemonSummary[];
  caughtIds: ReadonlySet<number>;
  onSelect: (pokemon: PokemonSummary) => void;
  /** Shown when there is nothing to list at all (no search involved). */
  empty: ReactElement;
  /** Shown above the search, e.g. the offline notice. */
  banner?: ReactElement;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isRefreshing?: boolean;
  error?: AppError | null;
  onEndReached?: () => void;
  onRefresh?: () => void;
  onRetry?: () => void;
}

/**
 * The one Pokémon list of the app: red search band, filtered grid and empty states.
 * Both the Pokédex and the caught screen render it, only with different items.
 */
export function PokemonBrowser({
  items,
  caughtIds,
  onSelect,
  empty,
  banner,
  hasMore = false,
  isLoadingMore = false,
  isRefreshing = false,
  error = null,
  onEndReached,
  onRefresh,
  onRetry,
}: PokemonBrowserProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  // Typing stays responsive while a large list is filtered.
  const deferredQuery = useDeferredValue(query);
  const hasQuery = normalizeSearch(deferredQuery).length > 0;

  const visible = useMemo(
    () => (hasQuery ? items.filter((pokemon) => matchesPokemon(pokemon, deferredQuery)) : items),
    [deferredQuery, hasQuery, items],
  );
  const clear = useCallback(() => setQuery(''), []);
  const [scrollY] = useState(() => new Animated.Value(0));
  // The ball rolls as the list is pulled down, then spins while refreshing.
  const roll = scrollY.interpolate({
    inputRange: [-400, 0],
    outputRange: ['-540deg', '0deg'],
    extrapolate: 'clamp',
  });

  const header = (
    <View style={{ marginHorizontal: -theme.spacing.md, marginTop: -theme.spacing.md }}>
      <View
        style={{
          backgroundColor: theme.colors.header,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.lg,
          borderBottomLeftRadius: theme.radius.lg + theme.spacing.sm,
          borderBottomRightRadius: theme.radius.lg + theme.spacing.sm,
          gap: theme.spacing.sm,
        }}
      >
        {/* Fills the pull-to-refresh overscroll so the header never shows a white gap. */}
        <View
          pointerEvents="none"
          style={[styles.overscroll, { backgroundColor: theme.colors.header }]}
        >
          {Platform.OS === 'ios' && onRefresh ? (
            <View style={styles.refresh} accessibilityElementsHidden>
              {isRefreshing ? (
                <Spinner size={30} />
              ) : (
                <Animated.View style={{ transform: [{ rotate: roll }] }}>
                  <Pokeball size={30} />
                </Animated.View>
              )}
            </View>
          ) : null}
        </View>
        {banner}
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or #number"
        />
        {hasQuery ? (
          <Text
            variant="caption"
            accessibilityLiveRegion="polite"
            style={{ color: theme.colors.onHeader, paddingHorizontal: theme.spacing.sm }}
          >
            {`${visible.length} found${hasMore ? ' so far · scroll to search more' : ''}`}
          </Text>
        ) : null}
      </View>
      <View style={{ height: theme.spacing.md }} />
    </View>
  );

  const noMatches = (
    <StatusMessage
      icon="search"
      title="No Pokémon found"
      message={`Nothing matches “${query.trim()}”${hasMore ? ' in the Pokémon loaded so far' : ''}.`}
      actionLabel="Clear search"
      onAction={clear}
    />
  );

  return (
    <PokemonGrid
      items={visible}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      isRefreshing={isRefreshing}
      error={error}
      onEndReached={onEndReached}
      onRefresh={onRefresh}
      onRetry={onRetry}
      onSelect={onSelect}
      caughtIds={caughtIds}
      isFiltered={hasQuery}
      ListHeaderComponent={header}
      ListEmptyComponent={hasQuery ? noMatches : empty}
      scrollY={scrollY}
    />
  );
}

const OVERSCROLL = 1000;

const styles = StyleSheet.create({
  overscroll: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -OVERSCROLL,
    height: OVERSCROLL,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  refresh: {
    // Sits in the gap the pull opens above the search field.
    marginBottom: 18,
  },
});
