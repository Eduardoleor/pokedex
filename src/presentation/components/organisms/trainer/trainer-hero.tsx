import { StyleSheet, View } from 'react-native';

import { pokeball, useTheme, wordmark } from '../../../theme';
import type { TrainerRank } from '../../../utils';
import { Icon, Text, TrainerPortrait } from '../../atoms';
import { StickerLabel } from '../../molecules';

const OVERSCROLL = 1000;
/** How far the content below rises over the band. */
export const TRAINER_HERO_OVERLAP = 28;
const OVERLAP = TRAINER_HERO_OVERLAP;

export interface TrainerHeroProps {
  rank: TrainerRank;
  subtitle: string;
}

/**
 * Trainer card on the red band: portrait on one side, rank, level and the road to the
 * next title on the other, over faded Poké Balls.
 */
export function TrainerHero({ rank, subtitle }: TrainerHeroProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.band,
        {
          backgroundColor: theme.colors.header,
          borderBottomLeftRadius: theme.radius.lg + theme.spacing.md,
          borderBottomRightRadius: theme.radius.lg + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          // Room for the stat tiles that overlap the band's lower edge.
          paddingBottom: theme.spacing.xl + OVERLAP,
        },
      ]}
    >
      {/* Keeps the pull overscroll red, like the list screens. */}
      <View
        pointerEvents="none"
        style={[styles.overscroll, { backgroundColor: theme.colors.header }]}
      />
      <View pointerEvents="none" style={[styles.decor, styles.decorLarge]}>
        <Icon name="pokeball" size={260} color={pokeball.white} />
      </View>
      <View pointerEvents="none" style={[styles.decor, styles.decorSmall]}>
        <Icon name="pokeball" size={110} color={pokeball.white} />
      </View>

      <View style={[styles.row, { gap: theme.spacing.md }]}>
        <View style={styles.portrait}>
          <View style={styles.spotlight} />
          <TrainerPortrait height={210} />
        </View>

        <View style={[styles.info, { gap: theme.spacing.sm }]}>
          <StickerLabel text="Pokémon Trainer" />
          <Text
            style={[styles.rank, { color: theme.colors.onHeader }]}
            numberOfLines={2}
            accessibilityRole="header"
          >
            {rank.title}
          </Text>
          <View style={[styles.level, { borderRadius: theme.radius.pill }]}>
            <Text style={styles.levelText}>{`Lv. ${rank.level}`}</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.colors.onHeader }]}>{subtitle}</Text>

          {rank.next ? (
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={`${rank.next.remaining} more catches to ${rank.next.title}`}
              style={{ gap: theme.spacing.xs, marginTop: theme.spacing.xs }}
            >
              <View style={[styles.track, { borderRadius: theme.radius.pill }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.max(0.04, rank.next.progress) * 100}%`,
                      borderRadius: theme.radius.pill,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.next, { color: theme.colors.onHeader }]}>
                {`${rank.next.remaining} more to ${rank.next.title}`}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    overflow: 'visible',
  },
  overscroll: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -OVERSCROLL,
    height: OVERSCROLL,
  },
  decor: {
    position: 'absolute',
    opacity: 0.08,
  },
  decorLarge: {
    right: -70,
    top: -30,
  },
  decorSmall: {
    left: -30,
    bottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  portrait: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  spotlight: {
    position: 'absolute',
    bottom: 0,
    width: 110,
    height: 22,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  info: {
    flex: 1,
    paddingBottom: 6,
    alignItems: 'flex-start',
  },
  rank: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  level: {
    backgroundColor: wordmark.yellow,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  levelText: {
    color: wordmark.deepBlue,
    fontSize: 13,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.9,
  },
  track: {
    width: 150,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: wordmark.yellow,
  },
  next: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.85,
  },
});
