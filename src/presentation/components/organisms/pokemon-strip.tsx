import { useCallback, useEffect, useRef } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';

import type { PokemonSummary } from '@/domain/models';
import { PokemonThumb, THUMB_SIZE } from '@/presentation/components/molecules';
import { useTheme } from '@/presentation/theme';

export interface PokemonStripProps {
  items: PokemonSummary[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  /** Any touch on the strip; used to pause autoplay. */
  onInteraction: () => void;
}

export function PokemonStrip({ items, selectedIndex, onSelect, onInteraction }: PokemonStripProps) {
  const { theme } = useTheme();
  const listRef = useRef<FlatList<PokemonSummary>>(null);
  const itemSize = THUMB_SIZE + theme.spacing.md;

  useEffect(() => {
    if (items.length > 0) {
      listRef.current?.scrollToIndex({ index: selectedIndex, viewPosition: 0.5, animated: true });
    }
  }, [items.length, selectedIndex]);

  const renderItem = useCallback<ListRenderItem<PokemonSummary>>(
    ({ item, index }) => (
      <PokemonThumb
        pokemon={item}
        selected={index === selectedIndex}
        onPress={() => onSelect(index)}
      />
    ),
    [onSelect, selectedIndex],
  );

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      extraData={selectedIndex}
      // Keep every thumbnail mounted so the pop-in plays once per Pokémon, not on scroll.
      initialNumToRender={20}
      windowSize={21}
      removeClippedSubviews={false}
      showsHorizontalScrollIndicator={false}
      getItemLayout={(_, index) => ({ length: itemSize, offset: itemSize * index, index })}
      onScrollBeginDrag={onInteraction}
      // A horizontal list grows vertically by default and would eat the hero's space;
      // the extra room fits the selected thumbnail's scale.
      style={{ flexGrow: 0, height: THUMB_SIZE * 1.12 + theme.spacing.md * 2 }}
      contentContainerStyle={{
        // Centers the thumbnails while they fit (wide screens, web); scrolls once they don't.
        flexGrow: 1,
        justifyContent: 'center',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
      }}
    />
  );
}
