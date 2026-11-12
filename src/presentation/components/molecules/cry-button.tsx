import { View } from 'react-native';

import { useTheme } from '../../theme';
import type { CryStatus } from '../../types';
import { Button, Text } from '../atoms';

export interface CryButtonProps {
  status: CryStatus;
  unavailableOffline: boolean;
  onPress: () => void;
}

export function CryButton({ status, unavailableOffline, onPress }: CryButtonProps) {
  const { theme } = useTheme();

  const hint = unavailableOffline
    ? 'Connect to the internet to hear this cry'
    : status === 'error'
      ? "Couldn't play the cry. Tap to try again."
      : null;

  return (
    <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
      <Button
        label={status === 'playing' ? 'Playing…' : 'Play cry'}
        icon="volume"
        variant="secondary"
        loading={status === 'loading'}
        disabled={unavailableOffline || status === 'playing'}
        accessibilityHint="Plays the Pokémon's cry"
        onPress={onPress}
      />
      {hint ? (
        <Text variant="caption" tone="textMuted" align="center">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
