import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import type { PokemonSummary } from '@/domain/models';

import { useTheme } from '../../theme';
import { formatDexNumber, formatName } from '../../utils';
import { RemoteImage, Surface, Text } from '../atoms';

export interface PokemonCardProps {
  pokemon: PokemonSummary;
  onPress: (pokemon: PokemonSummary) => void;
}

function PokemonCardComponent({ pokemon, onPress }: PokemonCardProps) {
  const { theme } = useTheme();
  const name = formatName(pokemon.name);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, number ${pokemon.id}`}
      accessibilityHint="Opens the Pokémon details"
      onPress={() => onPress(pokemon)}
      style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.8 : 1 }]}
    >
      <Surface style={{ gap: theme.spacing.sm }}>
        <RemoteImage
          uri={pokemon.imageUrl}
          accessibilityLabel={`${name} artwork`}
          style={[styles.image, { borderRadius: theme.radius.md }]}
        />
        <Text variant="caption" tone="textMuted">
          {formatDexNumber(pokemon.id)}
        </Text>
        <Text variant="label" numberOfLines={1}>
          {name}
        </Text>
      </Surface>
    </Pressable>
  );
}

export const PokemonCard = memo(PokemonCardComponent);

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
});
