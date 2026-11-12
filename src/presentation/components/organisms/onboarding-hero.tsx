import { StyleSheet, View } from 'react-native';

import type { PokemonSummary } from '@/domain/models';

import { useTheme } from '../../theme';
import { formatDexNumber, formatName } from '../../utils';
import { Icon, RemoteImage, Text } from '../atoms';

export interface OnboardingHeroProps {
  pokemon: PokemonSummary | undefined;
  /** Shown while no Pokémon is ready yet. */
  placeholder: string;
}

/** Featured Pokémon over a blurred copy of its own artwork, so the backdrop follows it. */
export function OnboardingHero({ pokemon, placeholder }: OnboardingHeroProps) {
  const { theme } = useTheme();

  if (!pokemon) {
    return (
      <View style={[styles.center, { gap: theme.spacing.md }]}>
        <Icon name="pokeball" size={96} tone="primary" />
        <Text tone="textSecondary" align="center">
          {placeholder}
        </Text>
      </View>
    );
  }

  const name = formatName(pokemon.name);

  return (
    <View style={styles.fill}>
      <RemoteImage
        uri={pokemon.imageUrl}
        accessibilityLabel=""
        accessible={false}
        blurRadius={40}
        contentFit="cover"
        transition={400}
        style={[StyleSheet.absoluteFill, styles.backdrop]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: theme.colors.background,
            opacity: theme.scheme === 'dark' ? 0.55 : 0.35,
          },
        ]}
      />
      <View style={[styles.center, { gap: theme.spacing.xs }]}>
        <RemoteImage
          uri={pokemon.imageUrl}
          accessibilityLabel={`${name} artwork`}
          transition={300}
          style={[styles.artwork, { backgroundColor: 'transparent' }]}
        />
        <Text variant="caption" tone="textSecondary">
          {formatDexNumber(pokemon.id)}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  backdrop: {
    transform: [{ scale: 1.3 }],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artwork: {
    width: '62%',
    aspectRatio: 1,
    maxHeight: '70%',
  },
});
