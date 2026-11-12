import { memo, useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import type { PokemonSummary } from '@/domain/models';

import { useReduceMotion } from '../../hooks/use-reduce-motion';
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
  const reduceMotion = useReduceMotion();
  const name = formatName(pokemon.name);
  // Each thumbnail fades in when it mounts, i.e. right after the Pokémon is saved.
  const [appear] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      appear.setValue(1);
      return;
    }
    Animated.timing(appear, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear, reduceMotion]);

  return (
    // The shadow lives on an outer view: the inner one clips the artwork to the circle.
    <Animated.View
      style={{
        opacity: appear,
        transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }],
      }}
    >
      <View
        style={[
          styles.shadow,
          { borderRadius: theme.radius.pill, transform: [{ scale: selected ? 1.12 : 1 }] },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={name}
          accessibilityHint="Plays its cry"
          accessibilityState={{ selected }}
          onPress={() => onPress(pokemon)}
          style={({ pressed }) => [
            styles.thumb,
            {
              borderRadius: theme.radius.pill,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <RemoteImage
            uri={pokemon.imageUrl}
            accessibilityLabel={`${name} artwork`}
            style={[styles.image, { backgroundColor: 'transparent' }]}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export const PokemonThumb = memo(PokemonThumbComponent);

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
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
