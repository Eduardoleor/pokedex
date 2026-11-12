import type { ReactElement } from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { type ColorPalette, useTheme } from '../../theme';

/**
 * Stroke icons drawn on a 24×24 grid (2 pt stroke, round caps), so they render
 * identically on iOS and Android and take any theme color.
 */
const ICONS = {
  sun: () => (
    <>
      <Circle cx={12} cy={12} r={4} />
      <Line x1={12} y1={2} x2={12} y2={4} />
      <Line x1={12} y1={20} x2={12} y2={22} />
      <Line x1={2} y1={12} x2={4} y2={12} />
      <Line x1={20} y1={12} x2={22} y2={12} />
      <Line x1={4.93} y1={4.93} x2={6.34} y2={6.34} />
      <Line x1={17.66} y1={17.66} x2={19.07} y2={19.07} />
      <Line x1={4.93} y1={19.07} x2={6.34} y2={17.66} />
      <Line x1={17.66} y1={6.34} x2={19.07} y2={4.93} />
    </>
  ),
  moon: () => <Path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.6 6.6 0 0 0 10.7 10.7Z" />,
  contrast: (color: string) => (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 3a9 9 0 0 1 0 18Z" fill={color} />
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
  refresh: () => (
    <>
      <Path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <Path d="M20 4v5h-5" />
    </>
  ),
  search: () => (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Line x1={16.2} y1={16.2} x2={21} y2={21} />
    </>
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
