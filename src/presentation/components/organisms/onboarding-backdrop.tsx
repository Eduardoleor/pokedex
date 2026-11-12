import { StyleSheet, View } from 'react-native';

import type { PokemonSummary } from '@/domain/models';

import { useTheme } from '../../theme';
import { RemoteImage } from '../atoms';

/**
 * Full-screen blurred copy of the featured artwork, so the background follows
 * whichever Pokémon is featured.
 */
export function OnboardingBackdrop({ pokemon }: { pokemon: PokemonSummary | undefined }) {
  const { theme } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, styles.clip]} pointerEvents="none">
      {pokemon ? (
        <RemoteImage
          uri={pokemon.imageUrl}
          accessibilityLabel=""
          accessible={false}
          blurRadius={40}
          contentFit="cover"
          transition={400}
          style={[StyleSheet.absoluteFill, styles.image]}
        />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: theme.colors.background,
            opacity: theme.scheme === 'dark' ? 0.55 : 0.35,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  image: {
    transform: [{ scale: 1.3 }],
    backgroundColor: 'transparent',
  },
});
