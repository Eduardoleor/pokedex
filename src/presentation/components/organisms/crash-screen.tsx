import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { createTheme } from '../../theme';
import { haptics } from '../../utils';

export interface CrashScreenProps {
  error: Error;
  onRetry: () => void;
}

/**
 * Last resort when a screen throws while rendering. It uses no provider and no shared
 * component on purpose: the crash may have come from one of them.
 */
export function CrashScreen({ error, onRetry }: CrashScreenProps) {
  const theme = createTheme(useColorScheme() === 'dark' ? 'dark' : 'light');

  return (
    <View
      accessibilityRole="alert"
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        The app hit an unexpected problem. Your caught Pokémon are safe.
      </Text>
      {__DEV__ ? (
        <Text numberOfLines={4} style={[styles.detail, { color: theme.colors.textMuted }]}>
          {error.message}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Try again"
        onPress={() => {
          haptics.selection();
          onRetry();
        }}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.colors.primary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  detail: {
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
