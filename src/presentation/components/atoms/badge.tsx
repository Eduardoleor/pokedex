import { View, type ViewProps } from 'react-native';

import { useTheme } from '../../theme';
import { Text } from './text';

export interface BadgeProps extends ViewProps {
  label: string;
  backgroundColor: string;
  textColor: string;
}

export function Badge({ label, backgroundColor, textColor, style, ...rest }: BadgeProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
        },
        style,
      ]}
      {...rest}
    >
      <Text variant="caption" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
