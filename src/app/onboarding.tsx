import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/presentation/components/atoms';
import {
  InstructionsCarousel,
  OnboardingBackdrop,
  OnboardingHero,
  PokeballLauncher,
  PokemonStrip,
} from '@/presentation/components/organisms';
import { ONBOARDING_STEPS } from '@/presentation/content/onboarding-steps';
import { useAutoplay, useCryById, useOnboardingProgress } from '@/presentation/hooks';
import { useCaught } from '@/presentation/providers/caught-provider';
import { useOnboarding } from '@/presentation/providers/onboarding-provider';
import { useTheme } from '@/presentation/theme';
import type { ViewHandle } from '@/presentation/types';

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { complete, requestReveal } = useOnboarding();
  const { catchPokemon } = useCaught();
  const { ready, total, isComplete, isOffline } = useOnboardingProgress();

  const featured = useAutoplay(ready.length, { intervalMs: 2500 });
  const steps = useAutoplay(ONBOARDING_STEPS.length, { intervalMs: 4500 });
  const playCry = useCryById();
  const [capture] = useState(() => new Animated.Value(0));
  // Everything but the ball and the Pokémon fades while the Pokémon is pulled in.
  const fadeOut = { opacity: capture.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) };
  const artworkRef = useRef<ViewHandle>(null);

  const { select: selectFeatured } = featured;
  const onSelectPokemon = useCallback(
    (index: number) => {
      selectFeatured(index);
      const pokemon = ready[index];
      if (pokemon) {
        playCry(pokemon.id);
      }
    },
    [playCry, ready, selectFeatured],
  );

  // While Pokémon are still arriving, follow the newest one unless the user took over.
  const { goTo, isPaused } = featured;
  useEffect(() => {
    if (!isComplete && !isPaused && ready.length > 0) {
      goTo(ready.length - 1);
    }
  }, [goTo, isComplete, isPaused, ready.length]);

  const caught = ready[featured.index];
  const start = useCallback(() => {
    // The first catch is saved; the home Poké Ball celebrates it.
    if (caught) {
      catchPokemon(caught);
    }
    requestReveal();
    complete();
    router.replace('/');
  }, [catchPokemon, caught, complete, requestReveal]);

  const status = isOffline
    ? "Offline · we'll save them when you connect"
    : `${ready.length} of ${total} Pokémon saved`;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <OnboardingBackdrop pokemon={ready[featured.index]} />

      <OnboardingHero
        pokemon={ready[featured.index]}
        placeholder={isOffline ? 'No connection yet' : 'Getting your Pokédex ready…'}
        topInset={insets.top}
        bottomInset={theme.spacing.lg}
        capture={capture}
        artworkRef={artworkRef}
      />

      <View
        style={[
          {
            paddingTop: theme.spacing.sm,
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.lg,
            gap: theme.spacing.xl,
          },
        ]}
      >
        {/* The sheet's own surface fades with its content, leaving the blurred backdrop. */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.sheetSurface,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.lg + theme.spacing.sm,
              borderTopRightRadius: theme.radius.lg + theme.spacing.sm,
            },
            fadeOut,
          ]}
        />
        <Animated.View style={[{ marginHorizontal: -theme.spacing.lg }, fadeOut]}>
          <PokemonStrip
            items={ready}
            selectedIndex={featured.index}
            onSelect={onSelectPokemon}
            onInteraction={featured.pause}
          />
        </Animated.View>

        <Animated.View style={fadeOut}>
          <InstructionsCarousel
            steps={ONBOARDING_STEPS}
            index={steps.index}
            onSelect={steps.select}
            onInteraction={steps.pause}
          />
        </Animated.View>

        <PokeballLauncher
          targetRef={artworkRef}
          capture={capture}
          label="Catch your Pokémon!"
          onThrow={featured.pause}
          onCaught={start}
        />

        <Animated.View style={fadeOut}>
          <Text
            variant="caption"
            tone="textMuted"
            align="center"
            accessibilityLiveRegion="polite"
            style={styles.footerText}
          >
            {status}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  footerText: {
    fontSize: 11,
    opacity: 0.7,
  },
  sheetSurface: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
});
