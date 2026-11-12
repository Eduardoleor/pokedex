import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import { formatRelativeTime } from '../../utils';
import { Text } from '../atoms';

export interface ConnectionBannerProps {
  visible: boolean;
  updatedAt: number | null;
}

/** Quiet notice shown only when saved data is on screen because the network is unreachable. */
export function ConnectionBanner({ visible, updatedAt }: ConnectionBannerProps) {
  const { theme } = useTheme();

  if (!visible) {
    return null;
  }

  const savedAt = updatedAt === null ? '' : ` · saved ${formatRelativeTime(updatedAt)}`;

  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          marginHorizontal: theme.spacing.lg,
          marginTop: theme.spacing.sm,
        },
      ]}
    >
      <Text variant="caption" tone="textSecondary" align="center">
        {`Offline — showing saved data${savedAt}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: 'center',
  },
});
