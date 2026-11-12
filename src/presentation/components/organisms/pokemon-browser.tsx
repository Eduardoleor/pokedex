import { type ReactElement, useCallback, useDeferredValue, useMemo, useState } from 'react';
import { Animated, LayoutAnimation, Platform, Pressable, StyleSheet, View } from 'react-native';

import { SymbolView } from 'expo-symbols';

import { PokemonType } from '@/domain/enums';
import type { AppError } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';
import { Icon, Pokeball, Spinner, Text } from '@/presentation/components/atoms';
import {
  type FilterChip,
  FilterChips,
  SearchField,
  StatusMessage,
} from '@/presentation/components/molecules';
import { PokemonGrid } from '@/presentation/components/organisms/pokemon-grid';
import { usePokemonIdsByType } from '@/presentation/hooks/use-pokemon-ids-by-type';
import { useReduceMotion } from '@/presentation/hooks/use-reduce-motion';
import { MIN_TOUCH_SIZE, typeColors, useTheme } from '@/presentation/theme';
import {
  formatName,
  type Generation,
  GENERATIONS,
  isInGeneration,
  matchesPokemon,
  normalizeSearch,
} from '@/presentation/utils';

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
 * Both the Pokedex and the caught screen render it, only with different items.
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

  const [filtersOpen, setFiltersOpen] = useState(false);
  const reduceMotion = useReduceMotion();
  const toggleFilters = useCallback(() => {
    // The band grows with a soft spring and the chips fade in; the grid glides down with it.
    if (!reduceMotion) {
      LayoutAnimation.configureNext(FILTERS_ANIMATION);
    }
    setFiltersOpen((open) => !open);
  }, [reduceMotion]);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [type, setType] = useState<PokemonType | null>(null);
  const typeIds = usePokemonIdsByType(type);
  const filterCount = (generation ? 1 : 0) + (type ? 1 : 0);
  const isFiltered = hasQuery || filterCount > 0;

  const visible = useMemo(
    () =>
      items.filter(
        (pokemon) =>
          (!hasQuery || matchesPokemon(pokemon, deferredQuery)) &&
          (!generation || isInGeneration(pokemon.id, generation)) &&
          // While a type loads nothing matches yet, rather than flashing the whole list.
          (!type || (typeIds.ids?.has(pokemon.id) ?? false)),
      ),
    [deferredQuery, generation, hasQuery, items, type, typeIds.ids],
  );
  const clear = useCallback(() => {
    setQuery('');
    setGeneration(null);
    setType(null);
  }, []);
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
        <View style={[styles.searchRow, { gap: theme.spacing.sm }]}>
          <View style={styles.search}>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or #number"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filters"
            accessibilityHint="Filter Pokémon by generation or type"
            accessibilityState={{ expanded: filtersOpen }}
            accessibilityValue={filterCount ? { text: `${filterCount} active` } : undefined}
            onPress={toggleFilters}
            style={({ pressed }) => [
              styles.filterButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: filterCount ? theme.colors.accent : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <SymbolView
              name={{
                ios: 'line.3.horizontal.decrease',
                android: 'filter_list',
                web: 'filter_list',
              }}
              size={22}
              weight="semibold"
              tintColor={filterCount ? theme.colors.primary : theme.colors.textMuted}
              fallback={
                <Icon name="filter" size={22} tone={filterCount ? 'primary' : 'textMuted'} />
              }
            />
            {filterCount ? (
              <View style={[styles.filterCount, { backgroundColor: theme.colors.accent }]}>
                <Text variant="caption" style={styles.filterCountText}>
                  {filterCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
        {filtersOpen ? (
          <>
            <FilterChips
              title="Generation"
              icon="layers"
              chips={GENERATION_CHIPS}
              selected={generation}
              onSelect={setGeneration}
            />
            <FilterChips
              title="Type"
              icon="flame"
              chips={TYPE_CHIPS}
              selected={type}
              onSelect={setType}
            />
          </>
        ) : null}
        {isFiltered ? (
          <Text
            variant="caption"
            accessibilityLiveRegion="polite"
            style={{ color: theme.colors.onHeader, paddingHorizontal: theme.spacing.sm }}
          >
            {type && typeIds.isLoading
              ? `Loading ${formatName(type)} Pokémon…`
              : typeIds.error
                ? `Couldn't load ${formatName(type ?? '')} Pokémon. Check your connection.`
                : `${visible.length} found${hasMore ? ' so far · scroll to search more' : ''}`}
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
      message={`Nothing matches${hasQuery ? ` “${query.trim()}”` : ' these filters'}${hasMore ? ' in the Pokémon loaded so far' : ''}.`}
      actionLabel={filterCount ? 'Clear filters' : 'Clear search'}
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
      isFiltered={isFiltered}
      ListHeaderComponent={header}
      ListEmptyComponent={isFiltered ? noMatches : empty}
      scrollY={scrollY}
    />
  );
}

const FILTERS_ANIMATION = {
  duration: 320,
  create: {
    type: LayoutAnimation.Types.easeOut,
    property: LayoutAnimation.Properties.opacity,
    duration: 220,
  },
  update: { type: LayoutAnimation.Types.spring, springDamping: 0.82 },
  delete: {
    type: LayoutAnimation.Types.easeIn,
    property: LayoutAnimation.Properties.opacity,
    duration: 140,
  },
};

const GENERATION_CHIPS: FilterChip<Generation>[] = GENERATIONS.map((generation) => ({
  value: generation,
  label: generation.label,
}));

const TYPE_CHIPS: FilterChip<PokemonType>[] = Object.values(PokemonType).map((type) => ({
  value: type,
  label: formatName(type),
  activeColors: typeColors[type],
}));

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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  search: {
    flex: 1,
  },
  filterButton: {
    width: MIN_TOUCH_SIZE + 4,
    height: MIN_TOUCH_SIZE + 4,
    borderRadius: (MIN_TOUCH_SIZE + 4) / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountText: {
    color: '#1A1A1A',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  refresh: {
    // Sits in the gap the pull opens above the search field.
    marginBottom: 18,
  },
});
