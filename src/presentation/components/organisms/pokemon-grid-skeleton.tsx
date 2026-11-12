import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import { Skeleton, Surface } from '../atoms';
import { useGridColumns } from './use-grid-columns';

const PLACEHOLDERS = 8;

export function PokemonGridSkeleton() {
  const { theme } = useTheme();
  const columns = useGridColumns();

  return (
    <View
      accessibilityLabel="Loading Pokémon"
      style={[styles.grid, { padding: theme.spacing.md, gap: theme.spacing.md }]}
    >
      {Array.from({ length: PLACEHOLDERS }, (_, index) => (
        <View key={index} style={{ width: `${100 / columns}%`, padding: theme.spacing.xs }}>
          <Surface style={{ gap: theme.spacing.sm }}>
            <Skeleton height={undefined} style={styles.image} radius={theme.radius.md} />
            <Skeleton width="40%" height={12} />
            <Skeleton width="70%" height={16} />
          </Surface>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    aspectRatio: 1,
  },
});
