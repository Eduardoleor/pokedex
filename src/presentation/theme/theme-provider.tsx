import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { useDependencies } from '@/di';
import { createTheme, type Theme } from '@/presentation/theme/theme';
import { type ColorScheme, ThemePreference } from '@/presentation/types';

const PREFERENCE_KEY = 'theme-preference';

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: unknown): value is ThemePreference {
  return Object.values(ThemePreference).includes(value as ThemePreference);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { preferences } = useDependencies();
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState(ThemePreference.System);

  useEffect(() => {
    let active = true;
    preferences
      .get<ThemePreference>(PREFERENCE_KEY)
      .then((saved) => {
        if (active && saved && isThemePreference(saved.value)) {
          setPreferenceState(saved.value);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [preferences]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      preferences.set(PREFERENCE_KEY, next).catch(() => undefined);
    },
    [preferences],
  );

  const scheme: ColorScheme =
    preference === ThemePreference.System
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const value = useMemo(
    () => ({ theme: createTheme(scheme), preference, setPreference }),
    [scheme, preference, setPreference],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return context;
}
