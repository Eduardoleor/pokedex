import { Platform } from 'react-native';

import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { DependenciesProvider } from '@/di';
import { IconButton } from '@/presentation/components/atoms';
import { NavigationTheme } from '@/presentation/navigation';
import { CaughtProvider } from '@/presentation/providers/caught-provider';
import { OnboardingProvider } from '@/presentation/providers/onboarding-provider';
import { PokemonDataProvider } from '@/presentation/providers/pokemon-data';
import { ThemeProvider, useTheme } from '@/presentation/theme';

// Hidden by OnboardingProvider once it knows whether onboarding comes first.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <DependenciesProvider>
      <ThemeProvider>
        <OnboardingProvider>
          <CaughtProvider>
            <PokemonDataProvider>
              <NavigationTheme>
                <AppStack />
              </NavigationTheme>
            </PokemonDataProvider>
          </CaughtProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </DependenciesProvider>
  );
}

/** Every header wears the Poké Ball red, with heavy white titles like the onboarding. */
function AppStack() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.header },
        headerTintColor: theme.colors.onHeader,
        headerTitleStyle: { fontWeight: '900' },
        headerBackButtonDisplayMode: 'minimal',
        statusBarStyle: 'light',
        // iOS 26 wraps the system back button in a glass bubble that turns pink over the
        // red header; a plain chevron without that background matches the home buttons.
        ...(Platform.OS === 'ios' && {
          unstable_headerLeftItems: ({ canGoBack }) =>
            canGoBack
              ? [
                  {
                    type: 'custom',
                    hidesSharedBackground: true,
                    element: (
                      <IconButton
                        icon="chevron-left"
                        color={theme.colors.onHeader}
                        accessibilityLabel="Back"
                        onPress={() => router.back()}
                      />
                    ),
                  },
                ]
              : [],
        }),
      }}
    >
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="caught" options={{ title: 'Caught' }} />
    </Stack>
  );
}
