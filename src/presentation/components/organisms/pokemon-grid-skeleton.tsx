import { StyleSheet, View } from 'react-native';

import { Skeleton, Surface } from '@/presentation/components/atoms';
import { useGridColumns } from '@/presentation/components/organisms/use-grid-columns';
import { useTheme } from '@/presentation/theme';

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
