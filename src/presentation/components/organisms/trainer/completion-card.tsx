import { StyleSheet, View } from 'react-native';

import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../../../theme';
import { Surface, Text } from '../../atoms';

const SIZE = 112;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface CompletionCardProps {
  caught: number;
  total: number;
  /** Short line under the totals, e.g. the best generation. */
  highlight: string;
}

/** National Pokedex completion as a ring, with the raw numbers beside it. */
export function CompletionCard({ caught, total, highlight }: CompletionCardProps) {
  const { theme } = useTheme();
  const ratio = Math.min(1, caught / total);
  const percent = Math.round(ratio * 1000) / 10;
  // A sliver stays visible so a first catch already shows on the ring.
  const visible = caught > 0 ? Math.max(ratio, 0.015) : 0;

  return (
    <Surface style={[styles.row, { gap: theme.spacing.lg }]}>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${percent}% of the Pokedex caught`}
        style={styles.ring}
      >
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={theme.colors.surfaceMuted}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={theme.colors.primary}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * visible} ${CIRCUMFERENCE}`}
            fill="none"
            rotation={-90}
            originX={SIZE / 2}
            originY={SIZE / 2}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={styles.percent}>{`${percent}%`}</Text>
          <Text variant="caption" tone="textMuted">
            complete
          </Text>
        </View>
      </View>
      <View style={[styles.flex, { gap: theme.spacing.xs }]}>
        <Text variant="heading" accessibilityRole="header">
          Pokedex
        </Text>
        <Text>
          <Text style={styles.big}>{String(caught)}</Text>
          <Text tone="textMuted">{` / ${total}`}</Text>
        </Text>
        <Text variant="caption" tone="textSecondary">
          {highlight}
        </Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ring: {
    width: SIZE,
    height: SIZE,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  flex: {
    flex: 1,
  },
  big: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
});
