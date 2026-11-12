import { Stack } from 'expo-router';

import { DependenciesProvider } from '@/di';
import { NavigationTheme } from '@/presentation/navigation';
import { PokemonDataProvider } from '@/presentation/providers/pokemon-data';
import { ThemeProvider } from '@/presentation/theme';

export default function RootLayout() {
  return (
    <DependenciesProvider>
      <ThemeProvider>
        <PokemonDataProvider>
          <NavigationTheme>
            <Stack screenOptions={{ headerShadowVisible: false }} />
          </NavigationTheme>
        </PokemonDataProvider>
      </ThemeProvider>
    </DependenciesProvider>
  );
}
