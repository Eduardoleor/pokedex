import { type ReactNode, type RefObject, useEffect, useMemo, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PokemonType } from '@/domain/enums';
import type { PokemonDetail } from '@/domain/models';
import {
  Icon,
  type IconName,
  Pokeball,
  RemoteImage,
  Surface,
  Text,
} from '@/presentation/components/atoms';
import { Section, StatBar, TypeBadge } from '@/presentation/components/molecules';
import { pokeball, typeColors, useTheme, wordmark } from '@/presentation/theme';
import type { ViewHandle } from '@/presentation/types';
import {
  formatDexNumber,
  formatHeight,
  formatName,
  formatStatName,
  formatWeight,
  haptics,
  typeMatchups,
} from '@/presentation/utils';

const OVERSCROLL = 1000;
/** Height of the transparent navigation bar the hero sits under. */
const BAR_HEIGHT = Platform.OS === 'ios' ? 54 : 56;
/** Scroll offset where the compact bar is fully in. */
const COLLAPSE_AT = 140;
/** How far the sheet rises over the hero. */
const SHEET_OVERLAP = 36;
const ARTWORK_SIZE = 260;
/** Last National Pokedex number, for the next/previous links. */
const LAST_DEX = 1025;

export interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
  isCaught?: boolean;
  /** Rendered beside the name, e.g. the cry button. */
  heroAction?: ReactNode;
  /** Rendered at the top of the sheet, e.g. the Poké Ball to catch it. */
  catchSlot?: ReactNode;
  /** The artwork view, so a thrown Poké Ball knows where to fly. */
  artworkRef?: RefObject<ViewHandle | null>;
  /** 0 → 1 pulls the artwork into the ball. */
  capture?: Animated.Value;
  /** −1 squash, 0 rest, 1 giant: extra emphasis on the artwork. */
  grow?: Animated.Value;
  /** Rendered over the artwork, e.g. the catch celebration. */
  artworkOverlay?: ReactNode;
  /** False while the Poké Ball is being dragged, so the page holds still. */
  scrollEnabled?: boolean;
  /** Fires when the compact bar takes over from the hero, and back. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Opens a neighbouring Pokedex number. */
  onNavigate?: (id: number) => void;
}

/**
 * A Pokedex entry: a hero painted in the main type's color with a giant dex number and
 * the artwork, and a rounded sheet below that splits the data into tabs.
 */
export function PokemonDetailView({
  pokemon,
  isCaught = false,
  heroAction,
  catchSlot,
  artworkRef,
  capture,
  grow,
  artworkOverlay,
  scrollEnabled = true,
  onCollapsedChange,
  onNavigate,
}: PokemonDetailViewProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [scrollY] = useState(() => new Animated.Value(0));
  const [stageTop, setStageTop] = useState<number | null>(null);
  const name = formatName(pokemon.name);
  const typeColor = pokemon.types[0]
    ? typeColors[pokemon.types[0]]
    : { background: theme.colors.primary, text: theme.colors.onPrimary };
  const heroText = typeColor.text;
  const barHeight = insets.top + BAR_HEIGHT;

  useEffect(() => {
    let collapsed = false;
    const id = scrollY.addListener(({ value }) => {
      const next = value > COLLAPSE_AT;
      if (next !== collapsed) {
        collapsed = next;
        onCollapsedChange?.(next);
      }
    });
    return () => scrollY.removeListener(id);
  }, [onCollapsedChange, scrollY]);

  const barOpacity = scrollY.interpolate({
    inputRange: [COLLAPSE_AT - 60, COLLAPSE_AT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const barTitleShift = scrollY.interpolate({
    inputRange: [COLLAPSE_AT - 60, COLLAPSE_AT],
    outputRange: [10, 0],
    extrapolate: 'clamp',
  });
  // The artwork drifts slower than the page and shrinks a little: a soft parallax.
  const artParallax = scrollY.interpolate({
    inputRange: [-200, 0, 300],
    outputRange: [-40, 0, 90],
    extrapolate: 'clamp',
  });
  const artScroll = scrollY.interpolate({
    inputRange: [-200, 0, 300],
    outputRange: [1.15, 1, 0.85],
    extrapolate: 'clamp',
  });

  // Catch and release animate on the JS thread while the scroll parallax runs natively,
  // so each drives its own view: mixing them on one node throws.
  const artworkScale = Animated.multiply(
    capture ? capture.interpolate({ inputRange: [0, 1], outputRange: [1, 0.05] }) : 1,
    grow ? grow.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.8, 1, 1.35] }) : 1,
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.surface }]}>
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        scrollEnabled={scrollEnabled}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: insets.bottom + theme.spacing.xxl }}
      >
        <View
          style={{
            backgroundColor: typeColor.background,
            paddingTop: barHeight,
            paddingBottom: SHEET_OVERLAP,
          }}
        >
          <View
            pointerEvents="none"
            style={[styles.overscroll, { backgroundColor: typeColor.background }]}
          />
          {/* The dex number as a giant watermark behind everything. */}
          <Text
            pointerEvents="none"
            numberOfLines={1}
            maxFontSizeMultiplier={1}
            style={[styles.watermark, { color: heroText, top: barHeight - 10 }]}
          >
            {formatDexNumber(pokemon.id)}
          </Text>

          <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}>
            <View style={[styles.row, { gap: theme.spacing.md }]}>
              <View style={[styles.flex, { gap: theme.spacing.xs }]}>
                <Text style={[styles.dex, { color: heroText }]}>{formatDexNumber(pokemon.id)}</Text>
                <Text
                  accessibilityRole="header"
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  maxFontSizeMultiplier={1.4}
                  style={[styles.name, { color: heroText }]}
                >
                  {name}
                </Text>
              </View>
              {heroAction}
            </View>
            <View style={[styles.row, { gap: theme.spacing.sm }]}>
              {pokemon.types.map((type) => (
                <View
                  key={type}
                  style={[
                    styles.typeChip,
                    { borderRadius: theme.radius.pill, gap: theme.spacing.xs },
                  ]}
                >
                  <Text style={[styles.typeChipText, { color: heroText }]}>{formatName(type)}</Text>
                </View>
              ))}
              {isCaught ? (
                <View
                  style={[
                    styles.typeChip,
                    { borderRadius: theme.radius.pill, gap: theme.spacing.xs },
                  ]}
                >
                  <Pokeball size={14} />
                  <Text style={[styles.typeChipText, { color: heroText }]}>Caught</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Reserves the artwork's room; the artwork itself is drawn above the sheet. */}
          <View
            onLayout={({ nativeEvent }) => setStageTop(nativeEvent.layout.y)}
            style={[styles.stage, { height: ARTWORK_SIZE + theme.spacing.xl }]}
          >
            <View pointerEvents="none" style={styles.stageBall}>
              <Icon name="pokeball" size={ARTWORK_SIZE + 40} color={pokeball.white} />
            </View>
          </View>
        </View>

        {/* The sheet: rounded top, rising over the hero. */}
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: SHEET_OVERLAP,
              borderTopRightRadius: SHEET_OVERLAP,
              marginTop: -SHEET_OVERLAP,
              paddingHorizontal: theme.spacing.lg,
              gap: theme.spacing.xl,
            },
          ]}
        >
          {catchSlot}

          {/* Every section stays on one page with a clear title: nothing hides behind tabs. */}
          <About pokemon={pokemon} accent={typeColor.background} />
          <Section title="Base stats">
            <Stats pokemon={pokemon} accent={typeColor.background} />
          </Section>
          <Section title="Type matchups">
            <Matchups types={pokemon.types} />
          </Section>

          {onNavigate ? (
            <View style={[styles.row, { gap: theme.spacing.md }]}>
              <Neighbour
                direction="previous"
                id={pokemon.id - 1}
                accent={typeColor.background}
                onAccent={heroText}
                disabled={pokemon.id <= 1}
                onPress={onNavigate}
              />
              <Neighbour
                direction="next"
                id={pokemon.id + 1}
                accent={typeColor.background}
                onAccent={heroText}
                disabled={pokemon.id >= LAST_DEX}
                onPress={onNavigate}
              />
            </View>
          ) : null}
        </View>
        {/* Above the sheet, so the parallax, the catch and the celebration never slip under it. */}
        {stageTop !== null ? (
          <View
            pointerEvents="box-none"
            style={[
              styles.stage,
              styles.artworkLayer,
              { top: stageTop, height: ARTWORK_SIZE + theme.spacing.xl },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={{ transform: [{ translateY: artParallax }, { scale: artScroll }] }}
            >
              <Animated.View
                ref={artworkRef}
                style={{
                  width: ARTWORK_SIZE,
                  height: ARTWORK_SIZE,
                  opacity: capture
                    ? capture.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] })
                    : 1,
                  transform: [{ scale: artworkScale }],
                }}
              >
                <RemoteImage
                  uri={pokemon.imageUrl}
                  accessibilityLabel={`${name} artwork`}
                  style={[StyleSheet.absoluteFill, styles.transparent]}
                />
              </Animated.View>
            </Animated.View>
            {artworkOverlay}
          </View>
        ) : null}
      </Animated.ScrollView>

      {/* Compact bar in the type's color with the small title, once the hero scrolls away. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bar,
          {
            height: barHeight,
            paddingTop: insets.top,
            backgroundColor: typeColor.background,
            opacity: barOpacity,
          },
        ]}
      >
        <Animated.Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={[styles.barTitle, { color: heroText, transform: [{ translateY: barTitleShift }] }]}
        >
          {name}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

function About({ pokemon, accent }: { pokemon: PokemonDetail; accent: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <View style={[styles.row, { gap: theme.spacing.md }]}>
        <Fact
          icon="ruler"
          value={formatHeight(pokemon.height)}
          label="Height"
          color={wordmark.blue}
        />
        <Fact icon="weight" value={formatWeight(pokemon.weight)} label="Weight" color={accent} />
        <Fact
          icon="star"
          value={pokemon.baseExperience?.toString() ?? '—'}
          label="Base exp."
          color="#E0A800"
        />
      </View>
      <Section title="Abilities">
        {pokemon.abilities.map((ability) => (
          <View
            key={ability.name}
            style={[
              styles.abilityRow,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                padding: theme.spacing.md,
                gap: theme.spacing.md,
              },
            ]}
          >
            <View style={[styles.abilityDot, { backgroundColor: accent }]} />
            <Text variant="body" style={[styles.flex, styles.bold]}>
              {formatName(ability.name)}
            </Text>
            {ability.isHidden ? (
              <Text variant="caption" tone="textMuted">
                Hidden ability
              </Text>
            ) : null}
          </View>
        ))}
      </Section>
    </View>
  );
}

function Stats({ pokemon, accent }: { pokemon: PokemonDetail; accent: string }) {
  const { theme } = useTheme();
  const total = pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);
  const sorted = [...pokemon.stats].sort((a, b) => b.value - a.value);
  const best = sorted[0];
  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={[styles.row, { gap: theme.spacing.md }]}>
        <Surface style={[styles.flex, { gap: 2 }]}>
          <Text variant="caption" tone="textMuted">
            Total
          </Text>
          <Text style={styles.big}>{String(total)}</Text>
        </Surface>
        {best ? (
          <Surface style={[styles.flex, { gap: 2 }]}>
            <Text variant="caption" tone="textMuted">
              Best stat
            </Text>
            <Text style={[styles.big, { color: accent }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatStatName(best.name)}
            </Text>
          </Surface>
        ) : null}
      </View>
      <View style={{ gap: theme.spacing.md }}>
        {pokemon.stats.map((stat) => (
          <StatBar key={stat.name} stat={stat} color={accent} />
        ))}
      </View>
    </View>
  );
}

function Matchups({ types }: { types: PokemonType[] }) {
  const { theme } = useTheme();
  const matchups = useMemo(() => typeMatchups(types), [types]);
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <MatchupGroup
        title="Weak to"
        empty="No weaknesses"
        items={matchups.weak.map((item) => ({ type: item.type, tag: `${item.multiplier}×` }))}
      />
      <MatchupGroup
        title="Resists"
        empty="No resistances"
        items={matchups.resistant.map((type) => ({ type }))}
      />
      {matchups.immune.length > 0 ? (
        <MatchupGroup
          title="Immune to"
          empty=""
          items={matchups.immune.map((type) => ({ type }))}
        />
      ) : null}
    </View>
  );
}

interface MatchupGroupProps {
  title: string;
  empty: string;
  items: { type: PokemonType; tag?: string }[];
}

function MatchupGroup({ title, empty, items }: MatchupGroupProps) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="label" tone="textSecondary">
        {title}
      </Text>
      {items.length === 0 ? (
        <Text tone="textMuted">{empty}</Text>
      ) : (
        <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
          {items.map((item) => (
            <View key={item.type} style={[styles.row, { gap: theme.spacing.xs }]}>
              <TypeBadge type={item.type} />
              {item.tag ? (
                <Text variant="caption" style={styles.bold}>
                  {item.tag}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface FactProps {
  icon: IconName;
  value: string;
  label: string;
  color: string;
}

function Fact({ icon, value, label, color }: FactProps) {
  const { theme } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[
        styles.fact,
        {
          backgroundColor: `${color}14`,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <Icon name={icon} size={20} color={color} />
      <View>
        <Text variant="heading" numberOfLines={1} adjustsFontSizeToFit style={styles.bold}>
          {value}
        </Text>
        <Text variant="caption" tone="textMuted">
          {label}
        </Text>
      </View>
    </View>
  );
}

interface NeighbourProps {
  direction: 'previous' | 'next';
  id: number;
  accent: string;
  /** Icon color that reads on top of `accent`. */
  onAccent: string;
  disabled: boolean;
  onPress: (id: number) => void;
}

/** Arrow and dex number of the neighbouring entry; the arrow sits on the outer edge. */
function Neighbour({ direction, id, accent, onAccent, disabled, onPress }: NeighbourProps) {
  const { theme } = useTheme();
  const isNext = direction === 'next';

  // Keeps the slot at the ends of the dex so the other button does not stretch.
  if (disabled) {
    return <View style={styles.flex} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${isNext ? 'Next' : 'Previous'} Pokémon, number ${id}`}
      onPress={() => {
        haptics.selection();
        onPress(id);
      }}
      style={({ pressed }) => [
        styles.flex,
        styles.row,
        {
          flexDirection: isNext ? 'row-reverse' : 'row',
          gap: theme.spacing.md,
          backgroundColor: `${accent}1A`,
          borderRadius: theme.radius.pill,
          padding: theme.spacing.xs,
          paddingRight: isNext ? theme.spacing.xs : theme.spacing.lg,
          paddingLeft: isNext ? theme.spacing.lg : theme.spacing.xs,
          justifyContent: 'space-between',
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <View style={[styles.arrow, { backgroundColor: accent }]}>
        <Icon name={isNext ? 'chevron-right' : 'chevron-left'} size={20} color={onAccent} />
      </View>
      <Text variant="heading" style={styles.bold}>
        {formatDexNumber(id)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bold: {
    fontWeight: '800',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  overscroll: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -OVERSCROLL,
    height: OVERSCROLL,
  },
  watermark: {
    position: 'absolute',
    right: -12,
    fontSize: 120,
    lineHeight: 130,
    fontWeight: '900',
    opacity: 0.12,
    letterSpacing: -4,
  },
  dex: {
    fontSize: 14,
    fontWeight: '800',
    opacity: 0.75,
    letterSpacing: 1,
  },
  name: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
  },
  stageBall: {
    position: 'absolute',
    opacity: 0.18,
  },
  sheet: {
    paddingTop: 8,
  },
  fact: {
    flex: 1,
  },
  abilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  abilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  big: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    // Leaves room for the back button on the left.
    paddingHorizontal: 72,
  },
});
