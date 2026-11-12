import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { PokemonSummary } from '@/domain/models';
import { Pokeball, RemoteImage, Text } from '@/presentation/components/atoms';
import { useTheme } from '@/presentation/theme';
import { formatDexNumber, formatName } from '@/presentation/utils';

export interface PokemonCardProps {
  pokemon: PokemonSummary;
  isCaught: boolean;
  onPress: (pokemon: PokemonSummary) => void;
}

/**
 * The artwork over a blurred, enlarged copy of itself (the onboarding backdrop in
 * miniature), on a soft floating card.
 */
function PokemonCardComponent({ pokemon, isCaught, onPress }: PokemonCardProps) {
  const { theme } = useTheme();
  const name = formatName(pokemon.name);
  const isDark = theme.scheme === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, number ${pokemon.id}${isCaught ? ', caught' : ''}`}
      accessibilityHint="Opens the Pokémon details"
      onPress={() => onPress(pokemon)}
      style={({ pressed }) => [
        styles.shadow,
        {
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surface,
          shadowOpacity: isDark ? 0.4 : 0.1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
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
          {/* A strong veil keeps only a hint of the artwork's colors behind it. */}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.colors.surface, opacity: isDark ? 0.72 : 0.78 },
            ]}
          />
          <RemoteImage
            uri={pokemon.imageUrl}
            accessibilityLabel={`${name} artwork`}
            style={styles.image}
          />
        </View>
        <View style={[styles.footer, { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
          <View style={styles.text}>
            <Text variant="caption" tone="textMuted" style={styles.number}>
              {formatDexNumber(pokemon.id)}
            </Text>
            <Text variant="label" numberOfLines={1} style={styles.name}>
              {name}
            </Text>
          </View>
          {isCaught ? <Pokeball size={18} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

export const PokemonCard = memo(PokemonCardComponent);

const styles = StyleSheet.create({
  shadow: {
    flex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
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
    width: '84%',
    height: '84%',
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  number: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: {
    fontWeight: '800',
  },
});
