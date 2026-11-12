import { StyleSheet, View } from 'react-native';

import { Surface, Text } from '@/presentation/components/atoms';
import { useTheme } from '@/presentation/theme';
import type { DayCount, GenerationCount } from '@/presentation/utils';

const CHART_HEIGHT = 120;

/** Catches per day for the last week: one red column per day, today highlighted. */
export function WeeklyCatchesChart({ days }: { days: DayCount[] }) {
  const { theme } = useTheme();
  const max = Math.max(1, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const summary = days.map((day) => `${day.label} ${day.count}`).join(', ');

  return (
    <Surface style={{ gap: theme.spacing.md }}>
      <View style={styles.between}>
        <Text variant="heading" accessibilityRole="header">
          This week
        </Text>
        <Text variant="label" tone="textSecondary">{`${total} caught`}</Text>
      </View>
      <View
        accessible
        accessibilityLabel={`Catches per day: ${summary}`}
        style={[styles.columns, { height: CHART_HEIGHT + 40, gap: theme.spacing.sm }]}
      >
        {days.map((day) => (
          <View key={day.key} style={[styles.column, { gap: theme.spacing.xs }]}>
            <Text variant="caption" tone={day.count > 0 ? 'textPrimary' : 'textMuted'}>
              {String(day.count)}
            </Text>
            <View
              style={[
                styles.track,
                {
                  height: CHART_HEIGHT,
                  backgroundColor: theme.colors.surfaceMuted,
                  borderRadius: theme.radius.sm,
                },
              ]}
            >
              <View
                style={{
                  height: `${(day.count / max) * 100}%`,
                  minHeight: day.count > 0 ? 6 : 0,
                  backgroundColor: theme.colors.primary,
                  opacity: day.isToday ? 1 : 0.55,
                  borderRadius: theme.radius.sm,
                }}
              />
            </View>
            <Text
              variant="caption"
              tone={day.isToday ? 'primary' : 'textMuted'}
              style={day.isToday && styles.bold}
            >
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    </Surface>
  );
}

/** Each generation as a tile in a 3×3 grid, with its own little progress bar. */
export function GenerationChart({ generations }: { generations: GenerationCount[] }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.grid, { gap: theme.spacing.sm }]}>
      {generations.map((generation) => {
        const started = generation.count > 0;
        return (
          <View
            key={generation.label}
            accessible
            accessibilityLabel={`${generation.label}: ${generation.count} of ${generation.total}`}
            style={[
              styles.cell,
              {
                backgroundColor: started ? `${theme.colors.primary}14` : theme.colors.surface,
                borderColor: started ? `${theme.colors.primary}55` : theme.colors.border,
                borderRadius: theme.radius.md,
                padding: theme.spacing.md,
                gap: theme.spacing.xs,
              },
            ]}
          >
            <Text variant="caption" tone={started ? 'primary' : 'textMuted'} style={styles.bold}>
              {generation.label}
            </Text>
            <Text style={styles.cellCount}>
              <Text style={styles.bold}>{String(generation.count)}</Text>
              <Text variant="caption" tone="textMuted">{` /${generation.total}`}</Text>
            </Text>
            <View
              style={[
                styles.bar,
                { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill },
              ]}
            >
              <View
                style={{
                  width: `${(generation.count / generation.total) * 100}%`,
                  minWidth: started ? 6 : 0,
                  height: '100%',
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.pill,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  between: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  track: {
    width: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bold: {
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    // Three per row with the grid's gaps.
    flexBasis: '31%',
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cellCount: {
    fontSize: 16,
    lineHeight: 22,
  },
  bar: {
    height: 6,
    overflow: 'hidden',
  },
});
