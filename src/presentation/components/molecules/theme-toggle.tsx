import { useTheme } from '../../theme';
import { ThemePreference } from '../../types';
import { IconButton } from '../atoms';

const NEXT: Record<ThemePreference, ThemePreference> = {
  [ThemePreference.System]: ThemePreference.Light,
  [ThemePreference.Light]: ThemePreference.Dark,
  [ThemePreference.Dark]: ThemePreference.System,
};

const ICONS: Record<ThemePreference, string> = {
  [ThemePreference.System]: '◐',
  [ThemePreference.Light]: '☀︎',
  [ThemePreference.Dark]: '☾',
};

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <IconButton
      icon={ICONS[preference]}
      accessibilityLabel={`Theme: ${preference}. Double tap to switch to ${NEXT[preference]}.`}
      onPress={() => setPreference(NEXT[preference])}
    />
  );
}
