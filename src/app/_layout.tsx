import { type ErrorBoundaryProps, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { DependenciesProvider } from '@/di';
import { OfflineSnackbar } from '@/presentation/components/molecules';
import { CrashScreen } from '@/presentation/components/organisms';
import { NavigationTheme } from '@/presentation/navigation';
import { CaughtProvider } from '@/presentation/providers/caught-provider';
import { NetworkProvider, useNetwork } from '@/presentation/providers/network-provider';
import { OnboardingProvider } from '@/presentation/providers/onboarding-provider';
import { PokemonDataProvider } from '@/presentation/providers/pokemon-data';
import { ThemeProvider, useTheme } from '@/presentation/theme';

// Hidden by OnboardingProvider once it knows whether onboarding comes first.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <DependenciesProvider>
      <ThemeProvider>
        <NetworkProvider>
          <OnboardingProvider>
            <CaughtProvider>
              <PokemonDataProvider>
                <NavigationTheme>
                  <AppStack />
                  <ConnectionSnackbar />
                </NavigationTheme>
              </PokemonDataProvider>
            </CaughtProvider>
          </OnboardingProvider>
        </NetworkProvider>
      </ThemeProvider>
    </DependenciesProvider>
  );
}

/** Replaces any screen that throws while rendering, instead of a blank crash. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <CrashScreen error={error} onRetry={() => void retry()} />;
}

function ConnectionSnackbar() {
  const { isOffline } = useNetwork();
  return <OfflineSnackbar isOffline={isOffline} />;
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
        // iOS 26 fades content under the bar; over the red band it reads as a grey shadow
        // and a seam between the header and the search, so the header stays flat instead.
        scrollEdgeEffects: { top: 'hidden', bottom: 'hidden', left: 'hidden', right: 'hidden' },
      }}
    >
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="caught" options={{ title: 'Caught' }} />
      <Stack.Screen name="profile" options={{ title: 'Trainer' }} />
      <Stack.Screen
        name="pokemon/[id]"
        // Transparent from the very first frame, so entering never flashes a solid bar.
        options={{
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTitle: '',
        }}
      />
    </Stack>
  );
}
