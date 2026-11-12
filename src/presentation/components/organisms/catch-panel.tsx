import { type RefObject, useCallback, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import type { PokemonSummary } from '@/domain/models';

import { useTheme } from '../../theme';
import type { ViewHandle } from '../../types';
import { formatName } from '../../utils';
import { Button, Pokeball, Text } from '../atoms';
import { StickerLabel } from '../molecules';
import { PokeballLauncher } from './pokeball-launcher';

export interface CatchPanelProps {
  pokemon: PokemonSummary;
  isCaught: boolean;
  artworkRef: RefObject<ViewHandle | null>;
  capture: Animated.Value;
  onCatch: (pokemon: PokemonSummary) => void;
  onRelease: (id: number) => void;
}

/**
 * Under the detail artwork: a Poké Ball to throw at the Pokémon, like in the onboarding,
 * or once it is caught, the ball it lives in and a way to release it.
 */
export function CatchPanel({
  pokemon,
  isCaught,
  artworkRef,
  capture,
  onCatch,
  onRelease,
}: CatchPanelProps) {
  const { theme } = useTheme();
  const name = formatName(pokemon.name);
  const [isThrown, setIsThrown] = useState(false);

  const caught = useCallback(() => {
    onCatch(pokemon);
    setIsThrown(false);
    // The Pokémon pops back out so the screen keeps showing it, now caught.
    Animated.timing(capture, {
      toValue: 0,
      duration: 420,
      delay: 250,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver: false,
    }).start();
  }, [capture, onCatch, pokemon]);

  if (isCaught) {
    return (
      <View style={[styles.caught, { gap: theme.spacing.sm, paddingTop: theme.spacing.md }]}>
        <Pokeball size={56} />
        <StickerLabel text={`${name} was caught!`} />
        <Button
          label="Release"
          variant="ghost"
          accessibilityHint={`Removes ${name} from your caught Pokémon`}
          onPress={() => onRelease(pokemon.id)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.launcher, { paddingTop: theme.spacing.lg }]}>
      <PokeballLauncher
        targetRef={artworkRef}
        capture={capture}
        label={`Catch ${name}!`}
        finale="stay"
        size={76}
        onThrow={() => setIsThrown(true)}
        onCaught={caught}
      />
      <Text
        variant="caption"
        tone="textMuted"
        align="center"
        style={{ marginTop: theme.spacing.sm, opacity: isThrown ? 0 : 1 }}
      >
        Swipe the Poké Ball up or tap it
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caught: {
    alignItems: 'center',
  },
  launcher: {
    alignItems: 'center',
    zIndex: 20,
  },
});
