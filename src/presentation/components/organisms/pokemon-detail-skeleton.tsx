import { StyleSheet, View } from 'react-native';

import { Skeleton, Surface } from '@/presentation/components/atoms';
import { useTheme } from '@/presentation/theme';

export function PokemonDetailSkeleton() {
  const { theme } = useTheme();

  return (
    <View
      accessibilityLabel="Loading Pokémon details"
      style={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
    >
      <View style={[styles.hero, { gap: theme.spacing.sm }]}>
        <Skeleton height={undefined} radius={theme.radius.lg} style={styles.artwork} />
        <Skeleton width={60} height={12} />
        <Skeleton width={180} height={32} />
        <Skeleton width={140} height={24} radius={theme.radius.pill} />
      </View>
      <Surface style={{ gap: theme.spacing.md }}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} height={14} />
        ))}
      </Surface>
    </View>
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
  },
});
