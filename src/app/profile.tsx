import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import Constants from 'expo-constants';
import { router } from 'expo-router';

import { Text } from '@/presentation/components/atoms';
import { Section, ThemePicker } from '@/presentation/components/molecules';
import {
  CompletionCard,
  GenerationChart,
  RecentCatches,
  type SettingsAction,
  SettingsGroup,
  StatTiles,
  TRAINER_HERO_OVERLAP,
  TrainerHero,
  WeeklyCatchesChart,
} from '@/presentation/components/organisms';
import { useCaught } from '@/presentation/providers/caught-provider';
import { useOnboarding } from '@/presentation/providers/onboarding-provider';
import { useResetSyncedData } from '@/presentation/providers/pokemon-data';
import { useTheme, wordmark } from '@/presentation/theme';
import { ThemePreference } from '@/presentation/types';
import {
  catchesByDay,
  catchesByGeneration,
  haptics,
  trainerDays,
  trainerRank,
} from '@/presentation/utils';

const RECENT_LIMIT = 10;
/** National Pokedex size; the API total also counts alternate forms. */
const NATIONAL_DEX = 1025;

export default function ProfileScreen() {
  const { theme, setPreference } = useTheme();
  const caught = useCaught();
  const onboarding = useOnboarding();
  const resetSyncedData = useResetSyncedData();
  const [isResetting, setIsResetting] = useState(false);

  const count = caught.items.length;
  const rank = useMemo(() => trainerRank(count), [count]);
  const days = useMemo(() => catchesByDay(caught.items), [caught.items]);
  const generations = useMemo(() => catchesByGeneration(caught.items), [caught.items]);
  const activeDays = useMemo(() => trainerDays(caught.items), [caught.items]);
  const regions = generations.filter((generation) => generation.count > 0).length;
  const best = generations.reduce(
    (top, generation) =>
      generation.count / generation.total > top.count / top.total ? generation : top,
    generations[0] ?? { label: 'Gen I', count: 0, total: 151 },
  );

  const subtitle =
    count === 0
      ? 'Ready for a first catch'
      : `Catching for ${activeDays} day${activeDays === 1 ? '' : 's'}`;

  const resetSynced = () =>
    Alert.alert(
      'Reset synced data?',
      'Saved Pokémon, artwork and cries are deleted and downloaded again. Your catches stay.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setIsResetting(true);
            resetSyncedData()
              .catch(() => {
                haptics.error();
                Alert.alert(
                  "Couldn't reset the data",
                  'Something went wrong while deleting the saved data. Please try again.',
                );
              })
              .finally(() => setIsResetting(false));
          },
        },
      ],
    );

  const releaseAll = () =>
    Alert.alert(
      'Release every Pokémon?',
      `All ${count} caught Pokémon go back to the wild. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release all',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            caught.releaseAll();
          },
        },
      ],
    );

  const eraseEverything = () =>
    Alert.alert(
      'Erase everything?',
      "Catches, synced data and settings are deleted and the onboarding starts again. This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase',
          style: 'destructive',
          onPress: () => {
            caught.releaseAll();
            setPreference(ThemePreference.System);
            void resetSyncedData()
              .catch(() => undefined)
              .finally(() => {
                onboarding.reset();
                router.dismissTo('/');
              });
          },
        },
      ],
    );

  const actions: SettingsAction[] = [
    {
      key: 'reset',
      icon: 'refresh',
      color: wordmark.blue,
      title: 'Reset synced data',
      detail: 'Download the Pokedex again',
      busy: isResetting,
      onPress: resetSynced,
    },
    {
      key: 'release',
      icon: 'pokeball',
      color: '#F59E0B',
      title: 'Release all Pokémon',
      detail: 'Empty your caught list',
      disabled: count === 0,
      onPress: releaseAll,
    },
    {
      key: 'erase',
      icon: 'alert',
      color: theme.colors.danger,
      title: 'Erase everything',
      detail: 'Start over from the onboarding',
      destructive: true,
      onPress: eraseEverything,
    },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
    >
      <TrainerHero rank={rank} subtitle={subtitle} />

      {/* The tiles overlap the band's bottom edge, like a card pulled out of it. */}
      <View
        style={[styles.content, { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.xl }]}
      >
        <StatTiles caught={count} days={activeDays} generations={regions} />

        <CompletionCard
          caught={count}
          total={NATIONAL_DEX}
          highlight={
            best.count > 0
              ? `Best region: ${best.label} · ${best.count}/${best.total}`
              : 'Every region is waiting for you'
          }
        />

        <Section
          title="Recent catches"
          action={count > RECENT_LIMIT ? `See all ${count}` : undefined}
          onAction={() => router.push('/caught')}
        >
          <RecentCatches
            items={caught.items.slice(0, RECENT_LIMIT)}
            onSelect={(pokemon) =>
              router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } })
            }
          />
        </Section>

        <Section title="Activity">
          <WeeklyCatchesChart days={days} />
        </Section>

        <Section title="Regions">
          <GenerationChart generations={generations} />
        </Section>

        <Section title="Appearance">
          <ThemePicker />
        </Section>

        <Section title="Data">
          <SettingsGroup actions={actions} />
        </Section>

        <Text variant="caption" tone="textMuted" align="center">
          {`Pokedex v${Constants.expoConfig?.version ?? '—'}`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: -TRAINER_HERO_OVERLAP,
  },
});
