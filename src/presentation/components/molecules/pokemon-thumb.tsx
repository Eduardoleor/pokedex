import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import type { PokemonSummary } from '@/domain/models';

import { useTheme } from '../../theme';
import { formatName } from '../../utils';
import { RemoteImage } from '../atoms';

export const THUMB_SIZE = 64;

export interface PokemonThumbProps {
  pokemon: PokemonSummary;
  selected: boolean;
  onPress: (pokemon: PokemonSummary) => void;
}

function PokemonThumbComponent({ pokemon, selected, onPress }: PokemonThumbProps) {
  const { theme } = useTheme();
  const name = formatName(pokemon.name);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ selected }}
      onPress={() => onPress(pokemon)}
      style={({ pressed }) => [
        styles.thumb,
        {
          borderRadius: theme.radius.pill,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.surface,
          transform: [{ scale: selected ? 1.12 : pressed ? 0.94 : 1 }],
        },
      ]}
    >
      <RemoteImage
        uri={pokemon.imageUrl}
        accessibilityLabel={`${name} artwork`}
        style={[styles.image, { backgroundColor: 'transparent' }]}
      />
    </Pressable>
  );
}

export const PokemonThumb = memo(PokemonThumbComponent);

const styles = StyleSheet.create({
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '82%',
    height: '82%',
  },
});
