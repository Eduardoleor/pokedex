import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ProgressBar, Text } from '@/presentation/components/atoms';
import {
  InstructionsCarousel,
  OnboardingHero,
  PokemonStrip,
} from '@/presentation/components/organisms';
import { ONBOARDING_STEPS } from '@/presentation/content/onboarding-steps';
import { useAutoplay, useOnboardingProgress } from '@/presentation/hooks';
import { useOnboarding } from '@/presentation/providers/onboarding-provider';
import { useTheme } from '@/presentation/theme';

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { complete } = useOnboarding();
  const { ready, total, isComplete, isOffline } = useOnboardingProgress();

  const featured = useAutoplay(ready.length, { intervalMs: 2500 });
  const steps = useAutoplay(ONBOARDING_STEPS.length, { intervalMs: 4500 });

  // While Pokémon are still arriving, follow the newest one unless the user took over.
  const { goTo, isPaused } = featured;
  useEffect(() => {
    if (!isComplete && !isPaused && ready.length > 0) {
      goTo(ready.length - 1);
    }
  }, [goTo, isComplete, isPaused, ready.length]);

  const start = useCallback(() => {
    complete();
    router.replace('/');
  }, [complete]);

  const status = isOffline
    ? "You're offline. We'll save your Pokémon as soon as you connect."
    : isComplete
      ? `${total} Pokémon saved for offline use`
      : `Saving Pokémon for offline use · ${ready.length}/${total}`;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.half, { paddingTop: insets.top }]}>
        <OnboardingHero
          pokemon={ready[featured.index]}
          placeholder={isOffline ? 'No connection yet' : 'Getting your Pokédex ready…'}
        />
        <PokemonStrip
          items={ready}
          selectedIndex={featured.index}
          onSelect={featured.select}
          onInteraction={featured.pause}
        />
      </View>

      <View
        style={[
          styles.half,
          styles.bottom,
          {
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            borderTopColor: theme.colors.band,
            paddingTop: theme.spacing.xl,
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.lg,
            gap: theme.spacing.lg,
          },
        ]}
      >
        <View style={{ gap: theme.spacing.sm }}>
          <ProgressBar value={ready.length / total} accessibilityLabel={status} />
          <Text
            variant="caption"
            tone="textSecondary"
            align="center"
            accessibilityLiveRegion="polite"
          >
            {status}
          </Text>
        </View>

        <View style={styles.carousel}>
          <InstructionsCarousel
            steps={ONBOARDING_STEPS}
            index={steps.index}
            onSelect={steps.select}
            onInteraction={steps.pause}
          />
        </View>

        <Button
          label={isComplete ? 'Start exploring' : 'Start now'}
          icon="pokeball"
          size="large"
          onPress={start}
          accessibilityHint="Opens the Pokédex. Saving continues in the background."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  half: {
    flex: 1,
  },
  bottom: {
    borderTopWidth: 4,
  },
  carousel: {
    flex: 1,
    justifyContent: 'center',
  },
});
