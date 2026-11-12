import { PokemonType } from '@/domain/enums';

import type { ColorScheme } from '../types';

/** Pokéball colors: the red top, the black band and the white bottom. */
export const pokeball = {
  red: '#E3350D',
  redDeep: '#CC0000',
  black: '#1C1C1E',
  white: '#FFFFFF',
} as const;

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
  /** The Pokéball band: strong outlines and accents. */
  band: string;
  danger: string;
  warning: string;
  skeleton: string;
}

export const palettes: Record<ColorScheme, ColorPalette> = {
  light: {
    background: '#F7F7F8',
    surface: pokeball.white,
    surfaceMuted: '#EFEFF1',
    border: '#E2E2E6',
    textPrimary: pokeball.black,
    textSecondary: '#48484A',
    textMuted: '#6E6E73',
    textInverse: pokeball.white,
    // Deep red keeps white labels above WCAG AA (5.9:1).
    primary: pokeball.redDeep,
    onPrimary: pokeball.white,
    band: pokeball.black,
    danger: '#B42318',
    warning: '#8A5A00',
    skeleton: '#E6E6EA',
  },
  dark: {
    background: '#121214',
    surface: pokeball.black,
    surfaceMuted: '#2A2A2E',
    border: '#38383C',
    textPrimary: '#F5F5F7',
    textSecondary: '#C7C7CC',
    textMuted: '#9A9AA0',
    textInverse: pokeball.black,
    primary: '#FF453A',
    onPrimary: '#121214',
    band: '#000000',
    danger: '#FF8A80',
    warning: '#F2C14E',
    skeleton: '#2A2A2E',
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
