import { type ReactElement, useCallback } from 'react';
import {
  Animated,
  type ListRenderItem,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import type { AppError } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';
import { Button, Spinner, Text } from '@/presentation/components/atoms';
import { PokemonCard } from '@/presentation/components/organisms/pokemon-card';
import { useGridColumns } from '@/presentation/components/organisms/use-grid-columns';
import { getErrorMessage } from '@/presentation/errors';
import { useTheme } from '@/presentation/theme';

export interface PokemonGridProps {
  items: PokemonSummary[];
  hasMore: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: AppError | null;
  onEndReached?: () => void;
  onRefresh?: () => void;
  onRetry?: () => void;
  onSelect: (pokemon: PokemonSummary) => void;
  caughtIds: ReadonlySet<number>;
  /** True while a search or the favorites filter hides part of the list. */
  isFiltered?: boolean;
  ListHeaderComponent?: ReactElement;
  ListEmptyComponent?: ReactElement;
  /** Receives the vertical scroll offset, e.g. to drive a custom refresh indicator. */
  scrollY?: Animated.Value;
}

export function PokemonGrid({
  items,
  hasMore,
  isLoadingMore,
  isRefreshing,
  error,
  onEndReached,
  onRefresh,
  onRetry,
  onSelect,
  caughtIds,
  isFiltered = false,
  ListHeaderComponent,
  ListEmptyComponent,
  scrollY,
}: PokemonGridProps) {
  const { theme } = useTheme();
  const columns = useGridColumns();

  const renderItem = useCallback<ListRenderItem<PokemonSummary>>(
    ({ item }) => (
      <View style={[styles.cell, { maxWidth: `${100 / columns}%`, padding: theme.spacing.sm }]}>
        <PokemonCard pokemon={item} isCaught={caughtIds.has(item.id)} onPress={onSelect} />
      </View>
    ),
    [caughtIds, columns, onSelect, theme.spacing.sm],
  );

  const footer = isLoadingMore ? (
    <Spinner size="large" style={{ margin: theme.spacing.xl }} />
  ) : error && items.length > 0 && hasMore ? (
    <View style={[styles.footer, { padding: theme.spacing.xl, gap: theme.spacing.md }]}>
      <Text tone="textSecondary" align="center">
        {getErrorMessage(error)}
      </Text>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  ) : !hasMore && items.length > 0 && !isFiltered ? (
    <Text variant="caption" tone="textMuted" align="center" style={{ margin: theme.spacing.xl }}>
      {`That's all ${items.length} Pokémon`}
    </Text>
  ) : undefined;

  return (
    <Animated.FlatList
      key={columns}
      data={items}
      extraData={caughtIds}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      numColumns={columns}
      contentInsetAdjustmentBehavior="automatic"
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={{ padding: theme.spacing.md }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={footer}
      onScroll={
        scrollY
          ? Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver: true,
            })
          : undefined
      }
      scrollEventThrottle={16}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            // iOS hides the native spinner: the list header draws a Poké Ball instead.
            tintColor={Platform.OS === 'ios' ? 'transparent' : theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
});
