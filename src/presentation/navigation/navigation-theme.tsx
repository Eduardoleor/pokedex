import { type ReactNode, useMemo } from 'react';

import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationThemeValue,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/presentation/theme';

/** Keeps headers, backgrounds and the status bar in sync with the app theme. */
export function NavigationTheme({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  const navigationTheme = useMemo<NavigationThemeValue>(() => {
    const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
      },
    };
  }, [theme]);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      {/* The red header needs light status bar content in both schemes. */}
      <StatusBar style="light" />
      {children}
    </NavigationThemeProvider>
  );
}
