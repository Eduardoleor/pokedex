import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Pokeball, RemoteImage, Text } from '@/presentation/components/atoms';
import type { CaughtPokemon } from '@/presentation/providers/caught-provider';
import { useTheme } from '@/presentation/theme';
import { formatDexNumber, formatName, formatShortDate } from '@/presentation/utils';

const CARD_WIDTH = 132;

export interface RecentCatchesProps {
  items: CaughtPokemon[];
  onSelect: (pokemon: CaughtPokemon) => void;
}

/** Latest catches as a swipeable row of mini cards, newest first. */
export function RecentCatches({ items, onSelect }: RecentCatchesProps) {
  const { theme } = useTheme();
  const isDark = theme.scheme === 'dark';

  if (items.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.xl,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <Pokeball size={40} />
        <Text tone="textSecondary" align="center">
          Open any Pokémon and throw a Poké Ball to catch it.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
      }}
      // Lets the cards' shadows breathe without clipping at the scroll view's edges.
      style={{ marginHorizontal: -theme.spacing.lg, marginBottom: -theme.spacing.lg }}
    >
      {items.map((pokemon) => {
        const name = formatName(pokemon.name);
        return (
          <Pressable
            key={pokemon.id}
            accessibilityRole="button"
            accessibilityLabel={`${name}, caught ${formatShortDate(pokemon.caughtAt)}`}
            onPress={() => onSelect(pokemon)}
            style={({ pressed }) => [
              styles.card,
              {
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.surface,
                shadowOpacity: isDark ? 0.4 : 0.1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <View style={[styles.clip, { borderRadius: theme.radius.lg }]}>
              <View style={styles.art}>
                <RemoteImage
                  uri={pokemon.imageUrl}
                  accessibilityLabel=""
                  accessible={false}
                  blurRadius={40}
                  contentFit="cover"
                  style={styles.backdrop}
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: theme.colors.surface, opacity: isDark ? 0.72 : 0.78 },
                  ]}
                />
                <RemoteImage uri={pokemon.imageUrl} accessibilityLabel="" style={styles.image} />
              </View>
              <View style={{ padding: theme.spacing.sm, gap: 2 }}>
                <Text variant="label" numberOfLines={1} style={styles.name}>
                  {name}
                </Text>
                <Text variant="caption" tone="textMuted" numberOfLines={1}>
                  {`${formatDexNumber(pokemon.id)} · ${formatShortDate(pokemon.caughtAt)}`}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  clip: {
    overflow: 'hidden',
  },
  art: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    transform: [{ scale: 1.5 }],
  },
  image: {
    width: '82%',
    height: '82%',
    backgroundColor: 'transparent',
  },
  name: {
    fontWeight: '800',
  },
});
