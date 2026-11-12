import { PokemonType } from '@/domain/enums';

import type { ColorScheme } from '../types';

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  onPrimary: string;
  danger: string;
  warning: string;
  skeleton: string;
}

export const palettes: Record<ColorScheme, ColorPalette> = {
  light: {
    background: '#F4F5F7',
    surface: '#FFFFFF',
    surfaceMuted: '#ECEEF2',
    border: '#DFE2E8',
    textPrimary: '#16181D',
    textSecondary: '#4A4F5A',
    textMuted: '#6B7180',
    textInverse: '#FFFFFF',
    primary: '#C8102E',
    onPrimary: '#FFFFFF',
    danger: '#B42318',
    warning: '#8A5A00',
    skeleton: '#E2E5EA',
  },
  dark: {
    background: '#0F1115',
    surface: '#181B21',
    surfaceMuted: '#222630',
    border: '#2C313C',
    textPrimary: '#F2F3F5',
    textSecondary: '#C3C7D0',
    textMuted: '#9AA0AD',
    textInverse: '#16181D',
    primary: '#FF5A6E',
    onPrimary: '#16181D',
    danger: '#FF8A80',
    warning: '#F2C14E',
    skeleton: '#262A33',
  },
};

interface TypeColor {
  background: string;
  text: string;
}

/** Badge colors per type; text colors chosen for WCAG AA contrast on each background. */
export const typeColors: Record<PokemonType, TypeColor> = {
  [PokemonType.Normal]: { background: '#A8A77A', text: '#16181D' },
  [PokemonType.Fire]: { background: '#EE8130', text: '#16181D' },
  [PokemonType.Water]: { background: '#3D7DCA', text: '#FFFFFF' },
  [PokemonType.Electric]: { background: '#F7D02C', text: '#16181D' },
  [PokemonType.Grass]: { background: '#5FA83A', text: '#16181D' },
  [PokemonType.Ice]: { background: '#96D9D6', text: '#16181D' },
  [PokemonType.Fighting]: { background: '#C22E28', text: '#FFFFFF' },
  [PokemonType.Poison]: { background: '#A33EA1', text: '#FFFFFF' },
  [PokemonType.Ground]: { background: '#E2BF65', text: '#16181D' },
  [PokemonType.Flying]: { background: '#A98FF3', text: '#16181D' },
  [PokemonType.Psychic]: { background: '#F95587', text: '#16181D' },
  [PokemonType.Bug]: { background: '#A6B91A', text: '#16181D' },
  [PokemonType.Rock]: { background: '#B6A136', text: '#16181D' },
  [PokemonType.Ghost]: { background: '#735797', text: '#FFFFFF' },
  [PokemonType.Dragon]: { background: '#6F35FC', text: '#FFFFFF' },
  [PokemonType.Dark]: { background: '#705746', text: '#FFFFFF' },
  [PokemonType.Steel]: { background: '#B7B7CE', text: '#16181D' },
  [PokemonType.Fairy]: { background: '#D685AD', text: '#16181D' },
};
