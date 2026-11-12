import { View } from 'react-native';

import { router, Stack } from 'expo-router';

import { StatusMessage } from '@/presentation/components/molecules';
import { useTheme } from '@/presentation/theme';

/** Any address the app does not know, e.g. a stale deep link. */
export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: 'Not found' }} />
      <StatusMessage
        icon="search"
        title="This page doesn't exist"
        message="The link may be broken or out of date."
        actionLabel="Back to the Pokedex"
        onAction={() => router.replace('/')}
      />
    </View>
  );
}
