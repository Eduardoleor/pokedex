import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/presentation/theme';

export interface SurfaceProps extends ViewProps {
  padded?: boolean;
}

export function Surface({ padded = true, style, ...rest }: SurfaceProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: padded ? theme.spacing.lg : 0,
        },
        styles.base,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
