import type { ColorScheme } from '../types';
import { type ColorPalette, palettes } from './palette';
import { radius, spacing, typography } from './tokens';

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
