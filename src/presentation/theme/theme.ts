import { type ColorPalette, palettes } from '@/presentation/theme/palette';
import { radius, spacing, typography } from '@/presentation/theme/tokens';
import type { ColorScheme } from '@/presentation/types';

export interface Theme {
  scheme: ColorScheme;
  colors: ColorPalette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export function createTheme(scheme: ColorScheme): Theme {
  return { scheme, colors: palettes[scheme], spacing, radius, typography };
}
