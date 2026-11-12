import { StyleSheet, View } from 'react-native';

import { Icon, type IconName, Text } from '@/presentation/components/atoms';
import { useTheme, wordmark } from '@/presentation/theme';

interface Tile {
  icon: IconName;
  value: string;
  label: string;
  /** Accent for the icon disc. */
  color: string;
}

/** Three floating tiles, each with its own accent from the Poké Ball and wordmark. */
export function StatTiles({
  caught,
  days,
  generations,
}: {
  caught: number;
  days: number;
  generations: number;
}) {
  const { theme } = useTheme();
  const tiles: Tile[] = [
    { icon: 'pokeball', value: String(caught), label: 'Caught', color: theme.colors.primary },
    {
      icon: 'sun',
      value: String(days),
      label: days === 1 ? 'Day' : 'Days',
      color: wordmark.yellow,
    },
    { icon: 'search', value: `${generations}/9`, label: 'Regions', color: wordmark.blue },
  ];

  return (
    <View style={[styles.row, { gap: theme.spacing.md }]}>
      {tiles.map((tile) => (
        <View
          key={tile.label}
          accessible
          accessibilityLabel={`${tile.value} ${tile.label}`}
          style={[
            styles.tile,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.md,
              gap: theme.spacing.sm,
              shadowOpacity: theme.scheme === 'dark' ? 0.4 : 0.08,
            },
          ]}
        >
          <View style={[styles.disc, { backgroundColor: `${tile.color}22` }]}>
            <Icon name={tile.icon} size={18} color={tile.color} />
          </View>
          <View>
            <Text variant="title" numberOfLines={1} adjustsFontSizeToFit style={styles.value}>
              {tile.value}
            </Text>
            <Text variant="caption" tone="textMuted">
              {tile.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  tile: {
    flex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  disc: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontWeight: '900',
  },
});
