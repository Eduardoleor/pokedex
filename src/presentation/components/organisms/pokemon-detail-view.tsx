import { Animated, ScrollView, StyleSheet, View } from 'react-native';

import type { ReactNode, RefObject } from 'react';

import type { PokemonDetail } from '@/domain/models';

import { useTheme } from '../../theme';
import type { ViewHandle } from '../../types';
import { formatDexNumber, formatHeight, formatName, formatWeight } from '../../utils';
import { Badge, RemoteImage, Surface, Text } from '../atoms';
import { InfoItem, StatBar, TypeBadge } from '../molecules';

export interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
  /** Rendered under the types, e.g. the cry button. */
  actions?: ReactNode;
  /** Rendered last in the hero, e.g. the Poké Ball to catch it. */
  catchSlot?: ReactNode;
  /** The artwork view, so a thrown Poké Ball knows where to fly. */
  artworkRef?: RefObject<ViewHandle | null>;
  /** 0 → 1 pulls the artwork into the ball. */
  capture?: Animated.Value;
}

export function PokemonDetailView({
  pokemon,
  actions,
  catchSlot,
  artworkRef,
  capture,
}: PokemonDetailViewProps) {
  const { theme } = useTheme();
  const name = formatName(pokemon.name);
  const total = pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
    >
      <View style={[styles.hero, { gap: theme.spacing.sm }]}>
        <View
          style={[
            styles.artwork,
            styles.shadow,
            {
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surface,
              shadowOpacity: theme.scheme === 'dark' ? 0.4 : 0.12,
            },
          ]}
        >
          {/* Same blurred backdrop as the onboarding and the list cards. */}
          <View style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: theme.radius.lg }]}>
            <RemoteImage
              uri={pokemon.imageUrl}
              accessibilityLabel=""
              accessible={false}
              blurRadius={36}
              contentFit="cover"
              style={styles.backdrop}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: theme.colors.surface,
                  opacity: theme.scheme === 'dark' ? 0.45 : 0.3,
                },
              ]}
            />
          </View>
          <Animated.View
            ref={artworkRef}
            style={[
              styles.image,
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
              style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
            />
          </Animated.View>
        </View>
        <Text variant="caption" tone="textMuted">
          {formatDexNumber(pokemon.id)}
        </Text>
        <Text variant="display" accessibilityRole="header" align="center">
          {name}
        </Text>
        <View style={[styles.row, { gap: theme.spacing.sm }]}>
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </View>
        {actions}
        {catchSlot}
      </View>

      <Surface style={styles.row}>
        <InfoItem label="Height" value={formatHeight(pokemon.height)} />
        <InfoItem label="Weight" value={formatWeight(pokemon.weight)} />
        <InfoItem label="Base exp." value={pokemon.baseExperience?.toString() ?? '—'} />
      </Surface>

      <Surface style={{ gap: theme.spacing.md }}>
        <Text variant="heading" accessibilityRole="header">
          Abilities
        </Text>
        <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
          {pokemon.abilities.map((ability) => (
            <Badge
              key={ability.name}
              label={
                ability.isHidden ? `${formatName(ability.name)} (hidden)` : formatName(ability.name)
              }
              backgroundColor={theme.colors.surfaceMuted}
              textColor={theme.colors.textPrimary}
            />
          ))}
        </View>
      </Surface>

      <Surface style={{ gap: theme.spacing.md }}>
        <View style={styles.between}>
          <Text variant="heading" accessibilityRole="header">
            Base stats
          </Text>
          <Text variant="label" tone="textSecondary">{`Total ${total}`}</Text>
        </View>
        {pokemon.stats.map((stat) => (
          <StatBar key={stat.name} stat={stat} />
        ))}
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
  },
  artwork: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '80%',
    height: '90%',
  },
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  clip: {
    overflow: 'hidden',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    transform: [{ scale: 1.5 }],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  between: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
