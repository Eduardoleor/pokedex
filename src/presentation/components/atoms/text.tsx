import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

import type { ReactNode } from 'react';

import { type ColorPalette, type TypographyVariant, useTheme } from '../../theme';

type TextTone = keyof Pick<
  ColorPalette,
  | 'textPrimary'
  | 'textSecondary'
  | 'textMuted'
  | 'textInverse'
  | 'primary'
  | 'onPrimary'
  | 'danger'
  | 'warning'
>;

export interface TextProps extends NativeTextProps {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
  children: ReactNode;
}

export function Text({
  variant = 'body',
  tone = 'textPrimary',
  align,
  style,
  maxFontSizeMultiplier = 1.6,
  ...rest
}: TextProps) {
  const { theme } = useTheme();

  return (
    <NativeText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[theme.typography[variant], { color: theme.colors[tone], textAlign: align }, style]}
      {...rest}
    />
  );
}
