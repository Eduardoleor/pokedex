import type { ReactElement } from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { type ColorPalette, useTheme } from '@/presentation/theme';

/**
 * Stroke icons drawn on a 24×24 grid (2 pt stroke, round caps), so they render
 * identically on iOS and Android and take any theme color.
 */
const ICONS = {
  sun: (color: string) => (
    <>
      <Circle cx={12} cy={12} r={4.2} fill={color} />
      <Line x1={12} y1={2.5} x2={12} y2={4.5} />
      <Line x1={12} y1={19.5} x2={12} y2={21.5} />
      <Line x1={2.5} y1={12} x2={4.5} y2={12} />
      <Line x1={19.5} y1={12} x2={21.5} y2={12} />
      <Line x1={5.3} y1={5.3} x2={6.7} y2={6.7} />
      <Line x1={17.3} y1={17.3} x2={18.7} y2={18.7} />
      <Line x1={5.3} y1={18.7} x2={6.7} y2={17.3} />
      <Line x1={17.3} y1={6.7} x2={18.7} y2={5.3} />
    </>
  ),
  moon: (color: string) => (
    <>
      <Path d="M20 14.6A8 8 0 1 1 9.4 4a6.3 6.3 0 0 0 10.6 10.6Z" fill={color} />
      <Path d="M17 3.5v3M15.5 5h3" strokeWidth={1.6} />
    </>
  ),
  /** A phone whose screen is half light, half dark: follow the device. */
  device: (color: string) => (
    <>
      <Rect x={6} y={2.5} width={12} height={19} rx={3} />
      <Path d="M12 8.5a3.5 3.5 0 0 1 0 7Z" fill={color} />
      <Circle cx={12} cy={12} r={3.5} strokeWidth={1.6} />
      <Line x1={10.5} y1={18.5} x2={13.5} y2={18.5} />
    </>
  ),
  'wifi-off': (color: string) => (
    <>
      <Path d="M2 8.8a15 15 0 0 1 20 0" />
      <Path d="M5.2 12.3a10.4 10.4 0 0 1 13.6 0" />
      <Path d="M8.6 15.8a5.6 5.6 0 0 1 6.8 0" />
      <Circle cx={12} cy={19.5} r={1} fill={color} />
      <Line x1={3} y1={3} x2={21} y2={21} />
    </>
  ),
  alert: (color: string) => (
    <>
      <Path d="M10.3 4 2.5 17.6A2 2 0 0 0 4.2 20.6h15.6a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z" />
      <Line x1={12} y1={9} x2={12} y2={13.5} />
      <Circle cx={12} cy={17} r={1} fill={color} />
    </>
  ),
  check: () => <Path d="M5 12.5 10 17.5 19 7" />,
  refresh: () => (
    <>
      <Path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <Path d="M20 4v5h-5" />
    </>
  ),
  volume: () => (
    <>
      <Path d="M11 5 6.5 9H3v6h3.5l4.5 4V5Z" />
      <Path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <Path d="M18.5 5.5a9.2 9.2 0 0 1 0 13" />
    </>
  ),
  pokeball: () => (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Line x1={3} y1={12} x2={8.6} y2={12} />
      <Line x1={15.4} y1={12} x2={21} y2={12} />
      <Circle cx={12} cy={12} r={3.2} />
    </>
  ),
  heart: () => (
    <Path d="M12 20.3s-7.8-4.6-9.2-9.6C1.9 7.4 4 4.2 7.3 4.2c2 0 3.6 1.1 4.7 2.8 1.1-1.7 2.7-2.8 4.7-2.8 3.3 0 5.4 3.2 4.5 6.5-1.4 5-9.2 9.6-9.2 9.6Z" />
  ),
  'heart-filled': (color: string) => (
    <Path
      d="M12 20.3s-7.8-4.6-9.2-9.6C1.9 7.4 4 4.2 7.3 4.2c2 0 3.6 1.1 4.7 2.8 1.1-1.7 2.7-2.8 4.7-2.8 3.3 0 5.4 3.2 4.5 6.5-1.4 5-9.2 9.6-9.2 9.6Z"
      fill={color}
    />
  ),
  'chevron-left': () => <Path d="M15 5 8 12l7 7" />,
  'chevron-right': () => <Path d="m9 5 7 7-7 7" />,
  close: () => (
    <>
      <Line x1={6} y1={6} x2={18} y2={18} />
      <Line x1={18} y1={6} x2={6} y2={18} />
    </>
  ),
  ruler: () => (
    <>
      <Rect x={2.5} y={8} width={19} height={8} rx={2} />
      <Line x1={7} y1={8} x2={7} y2={11} />
      <Line x1={11} y1={8} x2={11} y2={12} />
      <Line x1={15} y1={8} x2={15} y2={11} />
      <Line x1={19} y1={8} x2={19} y2={12} />
    </>
  ),
  weight: () => (
    <>
      <Path d="M9 7.5a3 3 0 1 1 6 0" />
      <Path d="M6.5 8.5h11l2 11.5h-15Z" />
    </>
  ),
  star: (color: string) => (
    <Path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7Z" fill={color} />
  ),
  search: () => (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Line x1={16.2} y1={16.2} x2={21} y2={21} />
    </>
  ),
  /** Two sliders with hollow knobs, the track broken around each knob. */
  filter: () => (
    <>
      <Path d="M4 8h7M17 8h3" />
      <Circle cx={14} cy={8} r={2.6} />
      <Path d="M4 16h3M13 16h7" />
      <Circle cx={10} cy={16} r={2.6} />
    </>
  ),
  /** Stacked layers: Pokedex generations. */
  layers: () => (
    <>
      <Path d="M12 3.5 21 8l-9 4.5L3 8Z" strokeLinejoin="round" />
      <Path d="m3 12 9 4.5 9-4.5" strokeLinejoin="round" />
      <Path d="m3 16 9 4.5 9-4.5" strokeLinejoin="round" />
    </>
  ),
  /** A flame: elemental types. */
  flame: () => (
    <Path
      d="M12 21c-3.6 0-6.2-2.5-6.2-5.9 0-3 2-4.9 3.4-6.6.3 1.6 1.1 2.7 2.2 3.2-.3-3.3 1.1-6 3.4-8.2.3 3 1.8 4.6 3 6.4 1 1.4 1.4 2.8 1.4 4.6 0 4-3 6.5-7.2 6.5Z"
      strokeLinejoin="round"
    />
  ),
} satisfies Record<string, (color: string) => ReactElement>;

export type IconName = keyof typeof ICONS;

type IconTone = keyof Pick<
  ColorPalette,
  'textPrimary' | 'textSecondary' | 'textMuted' | 'primary' | 'onPrimary' | 'danger'
>;

export interface IconProps {
  name: IconName;
  size?: number;
  tone?: IconTone;
  /** Overrides `tone` with an explicit color. */
  color?: string;
}

export function Icon({ name, size = 24, tone = 'textPrimary', color }: IconProps) {
  const { theme } = useTheme();
  const stroke = color ?? theme.colors[tone];

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {ICONS[name](stroke)}
    </Svg>
  );
}
