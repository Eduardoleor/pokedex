import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

import { useTheme } from '../../theme';

export function Spinner({ size = 'small', color, ...rest }: ActivityIndicatorProps) {
  const { theme } = useTheme();
  return (
    <ActivityIndicator
      accessibilityLabel="Loading"
      size={size}
      color={color ?? theme.colors.primary}
      {...rest}
    />
  );
}
