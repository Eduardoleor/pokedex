import { Animated, StyleSheet, View } from 'react-native';

import type { Ref } from 'react';

import type { PokemonSummary } from '@/domain/models';

import { useTheme } from '../../theme';
import type { ViewHandle } from '../../types';
import { formatDexNumber, formatName } from '../../utils';
import { Icon, RemoteImage, Text } from '../atoms';

export interface OnboardingHeroProps {
  pokemon: PokemonSummary | undefined;
  /** Shown while no Pokémon is ready yet. */
  placeholder: string;
  /** Status bar height, so the content starts below it. */
  topInset?: number;
  /** Space taken at the bottom by whatever overlaps the hero (the thumbnail strip). */
  bottomInset?: number;
  /** 0 → 1 while the Pokémon is pulled into the Poké Ball. */
  capture?: Animated.Value;
  /** Measured by the Poké Ball to know where to fly. */
  artworkRef?: Ref<ViewHandle>;
}

/** Featured Pokémon, large and centered; the backdrop is drawn behind the whole screen. */
export function OnboardingHero({
  pokemon,
  placeholder,
  topInset = 0,
  bottomInset = 0,
  capture,
  artworkRef,
}: OnboardingHeroProps) {
  const { theme } = useTheme();

  if (!pokemon) {
    return (
      <View
        style={[
          styles.center,
          { gap: theme.spacing.md, paddingTop: topInset, paddingBottom: bottomInset },
        ]}
      >
        <Icon name="pokeball" size={96} tone="primary" />
        <Text tone="textSecondary" align="center">
          {placeholder}
        </Text>
      </View>
    );
  }

  const name = formatName(pokemon.name);

  return (
    <View
      style={[
        styles.center,
        { gap: theme.spacing.xs, paddingTop: topInset, paddingBottom: bottomInset },
      ]}
    >
      <Animated.View
        ref={artworkRef}
        style={[
          styles.artwork,
          capture && {
            opacity: capture.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            transform: [
              { scale: capture.interpolate({ inputRange: [0, 1], outputRange: [1, 0.05] }) },
            ],
          },
        ]}
      >
        <RemoteImage
          uri={pokemon.imageUrl}
          accessibilityLabel={`${name} artwork`}
          transition={250}
          style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.caption,
          { gap: theme.spacing.xs },
          capture && { opacity: capture.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
        ]}
      >
        <Text variant="caption" tone="textSecondary">
          {formatDexNumber(pokemon.id)}
        </Text>
        <Text variant="display" accessibilityRole="header">
          {name}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    alignItems: 'center',
  },
  artwork: {
    width: '82%',
    aspectRatio: 1,
    maxHeight: '72%',
  },
});
