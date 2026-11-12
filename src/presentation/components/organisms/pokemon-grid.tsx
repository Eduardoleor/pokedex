import { type ReactElement, useCallback } from 'react';
import { FlatList, type ListRenderItem, RefreshControl, StyleSheet, View } from 'react-native';

import type { AppError } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';

import { getErrorMessage } from '../../errors';
import { useTheme } from '../../theme';
import { Button, Spinner, Text } from '../atoms';
import { PokemonCard } from './pokemon-card';
import { useGridColumns } from './use-grid-columns';

export interface PokemonGridProps {
  items: PokemonSummary[];
  hasMore: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: AppError | null;
  onEndReached: () => void;
  onRefresh: () => void;
  onRetry: () => void;
  onSelect: (pokemon: PokemonSummary) => void;
  ListHeaderComponent?: ReactElement;
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
  ListHeaderComponent,
}: PokemonGridProps) {
  const { theme } = useTheme();
  const columns = useGridColumns();

  const renderItem = useCallback<ListRenderItem<PokemonSummary>>(
    ({ item }) => (
      <View style={[styles.cell, { maxWidth: `${100 / columns}%`, padding: theme.spacing.xs }]}>
        <PokemonCard pokemon={item} onPress={onSelect} />
      </View>
    ),
    [columns, onSelect, theme.spacing.xs],
  );

  const footer = isLoadingMore ? (
    <Spinner style={{ margin: theme.spacing.xl }} />
  ) : error && items.length > 0 && hasMore ? (
    <View style={[styles.footer, { padding: theme.spacing.xl, gap: theme.spacing.md }]}>
      <Text tone="textSecondary" align="center">
        {getErrorMessage(error)}
      </Text>
      <Button label="Try again" variant="secondary" onPress={onRetry} />
    </View>
  ) : !hasMore && items.length > 0 ? (
    <Text variant="caption" tone="textMuted" align="center" style={{ margin: theme.spacing.xl }}>
      {`That's all ${items.length} Pokémon`}
    </Text>
  ) : undefined;

  return (
    <FlatList
      key={columns}
      data={items}
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
      ListFooterComponent={footer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          progressBackgroundColor={theme.colors.surface}
        />
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
