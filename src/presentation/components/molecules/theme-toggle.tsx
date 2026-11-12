import { useTheme } from '../../theme';
import { ThemePreference } from '../../types';
import { IconButton, type IconName } from '../atoms';

const NEXT: Record<ThemePreference, ThemePreference> = {
  [ThemePreference.System]: ThemePreference.Light,
  [ThemePreference.Light]: ThemePreference.Dark,
  [ThemePreference.Dark]: ThemePreference.System,
};

const ICONS: Record<ThemePreference, IconName> = {
  [ThemePreference.System]: 'contrast',
  [ThemePreference.Light]: 'sun',
  [ThemePreference.Dark]: 'moon',
};

export function ThemeToggle() {
  const { theme, preference, setPreference } = useTheme();

  return (
    <IconButton
      icon={ICONS[preference]}
      color={theme.colors.onHeader}
      accessibilityLabel={`Theme: ${preference}. Double tap to switch to ${NEXT[preference]}.`}
      onPress={() => setPreference(NEXT[preference])}
    />
  );
}
