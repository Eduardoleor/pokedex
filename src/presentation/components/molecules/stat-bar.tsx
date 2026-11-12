import { StyleSheet, View } from 'react-native';

import type { PokemonStat } from '@/domain/models';

import { useTheme } from '../../theme';
import { formatStatName } from '../../utils';
import { Text } from '../atoms';

/** Highest base stat in the games (Blissey's HP). */
const MAX_STAT = 255;

export function StatBar({ stat, color }: { stat: PokemonStat; color?: string }) {
  const { theme } = useTheme();
  const label = formatStatName(stat.name);
  const ratio = Math.min(stat.value / MAX_STAT, 1);

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${stat.value}`}
      style={[styles.row, { gap: theme.spacing.md }]}
    >
      <Text variant="label" tone="textSecondary" style={styles.label}>
        {label}
      </Text>
      <Text variant="label" style={styles.value}>
        {stat.value}
      </Text>
      <View
        style={[
          styles.track,
          { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: color ?? theme.colors.primary,
              borderRadius: theme.radius.pill,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    width: 64,
  },
  value: {
    width: 32,
    textAlign: 'right',
  },
  track: {
    flex: 1,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
