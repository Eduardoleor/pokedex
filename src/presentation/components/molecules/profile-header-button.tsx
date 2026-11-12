import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE } from '../../theme';
import { TrainerAvatar } from '../atoms';

/** The trainer's face in the header: opens the profile. */
export function ProfileHeaderButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Trainer profile"
      accessibilityHint="Shows your progress and settings"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.base, { opacity: pressed ? 0.7 : 1 }]}
    >
      <TrainerAvatar size={34} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: MIN_TOUCH_SIZE,
    minHeight: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
