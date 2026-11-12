import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { DependenciesProvider } from '@/di';
import { NavigationTheme } from '@/presentation/navigation';
import { OnboardingProvider } from '@/presentation/providers/onboarding-provider';
import { PokemonDataProvider } from '@/presentation/providers/pokemon-data';
import { ThemeProvider } from '@/presentation/theme';

// Hidden by OnboardingProvider once it knows whether onboarding comes first.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <DependenciesProvider>
      <ThemeProvider>
        <OnboardingProvider>
          <PokemonDataProvider>
            <NavigationTheme>
              <Stack screenOptions={{ headerShadowVisible: false }}>
                <Stack.Screen
                  name="onboarding"
                  options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
                />
              </Stack>
            </NavigationTheme>
          </PokemonDataProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </DependenciesProvider>
  );
}
