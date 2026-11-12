import { Platform } from 'react-native';

import * as ExpoHaptics from 'expo-haptics';

/**
 * Tactile feedback for the moments that matter. Every call is fire-and-forget and safe on
 * devices without a haptic engine (and on the web): a missing motor is never an error.
 */
function run(effect: () => Promise<void>): void {
  if (Platform.OS === 'web') {
    return;
  }
  effect().catch(() => undefined);
}

export const haptics = {
  /** A choice changed: a chip, a theme, a tab. */
  selection: () => run(() => ExpoHaptics.selectionAsync()),
  /** A soft tap: a button, a wobble of the Poké Ball. */
  light: () => run(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light)),
  /** The Poké Ball leaving the hand or opening. */
  medium: () => run(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium)),
  /** The Poké Ball clicking shut. */
  heavy: () => run(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy)),
  /** A Pokémon was caught. */
  success: () =>
    run(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success)),
  /** Something was released or removed. */
  warning: () =>
    run(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning)),
  /** An action failed. */
  error: () => run(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error)),
};
