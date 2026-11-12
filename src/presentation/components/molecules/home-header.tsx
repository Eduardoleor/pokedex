import { StyleSheet, View } from 'react-native';

import type { ReactElement } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/presentation/components/atoms';
import { useTheme } from '@/presentation/theme';

/** Height of the iOS navigation bar, so the home lines up with the native headers. */
const BAR_HEIGHT = 44;

export interface HomeHeaderProps {
  left: ReactElement;
  title: string;
  right: ReactElement;
}

/**
 * The home's own red bar. A native bar puts a glass pill behind each item on iOS 26 and,
 * with custom items, a grey edge blur over the search below it, so the home skips it.
 */
export function HomeHeader({ left, title, right }: HomeHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: theme.colors.header,
        paddingTop: insets.top,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      <View style={styles.row}>
        <View style={styles.side}>{left}</View>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={[styles.title, { color: theme.colors.onHeader }]}
        >
          {title}
        </Text>
        <View style={[styles.side, styles.end]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    flex: 1,
    alignItems: 'flex-start',
  },
  end: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
  },
});
