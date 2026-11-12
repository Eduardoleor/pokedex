import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { Icon, Text } from '../atoms';

const BACK_ONLINE_MS = 2500;
const HIDDEN_OFFSET = 24;

export interface OfflineSnackbarProps {
  isOffline: boolean;
}

/**
 * Floating notice at the bottom. It never takes touches, so every action under it keeps
 * working. Announces the loss of connection and, briefly, its return.
 */
export function OfflineSnackbar({ isOffline }: OfflineSnackbarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [progress] = useState(() => new Animated.Value(0));
  const wasOffline = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;

    if (isOffline) {
      wasOffline.current = true;
      Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    } else if (wasOffline.current) {
      wasOffline.current = false;
      timer = setTimeout(
        () =>
          Animated.timing(progress, { toValue: 0, duration: 220, useNativeDriver: true }).start(),
        BACK_ONLINE_MS,
      );
    }

    return () => clearTimeout(timer);
  }, [isOffline, progress]);

  const offline = isOffline;

  return (
    <View pointerEvents="none" style={[styles.host, { bottom: insets.bottom + theme.spacing.lg }]}>
      <Animated.View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[
          styles.snackbar,
          {
            backgroundColor: '#1F1F23',
            borderRadius: theme.radius.pill,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            gap: theme.spacing.sm,
            opacity: progress,
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [HIDDEN_OFFSET, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Icon name={offline ? 'wifi-off' : 'check'} size={18} color="#FFFFFF" />
        <Text variant="label" style={styles.text}>
          {offline ? "You're offline · showing saved data" : 'Back online'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    color: '#FFFFFF',
  },
});
