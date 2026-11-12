import { ScrollView, StyleSheet, View } from 'react-native';

import type { ReactNode } from 'react';

import type { PokemonDetail } from '@/domain/models';

import { typeColors, useTheme } from '../../theme';
import { formatDexNumber, formatHeight, formatName, formatWeight } from '../../utils';
import { Badge, RemoteImage, Surface, Text } from '../atoms';
import { InfoItem, StatBar, TypeBadge } from '../molecules';

export interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
  /** Rendered under the types, e.g. the cry button. */
  actions?: ReactNode;
}

export function PokemonDetailView({ pokemon, actions }: PokemonDetailViewProps) {
  const { theme } = useTheme();
  const name = formatName(pokemon.name);
  const accent = pokemon.types[0]
    ? typeColors[pokemon.types[0]].background
    : theme.colors.surfaceMuted;
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
            { backgroundColor: `${accent}33`, borderRadius: theme.radius.lg },
          ]}
        >
          <RemoteImage
            uri={pokemon.imageUrl}
            accessibilityLabel={`${name} artwork`}
            style={[styles.image, { backgroundColor: 'transparent' }]}
          />
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
