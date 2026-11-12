import { View } from 'react-native';

import { useTheme } from '../../theme';

export interface PageDotsProps {
  count: number;
  active: number;
}

export function PageDots({ count, active }: PageDotsProps) {
  const { theme } = useTheme();

  return (
    <View
      accessibilityLabel={`Page ${active + 1} of ${count}`}
      style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs }}
    >
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={{
            width: index === active ? 18 : 6,
            height: 6,
            borderRadius: theme.radius.pill,
            backgroundColor: index === active ? theme.colors.primary : theme.colors.border,
          }}
        />
      ))}
    </View>
  );
}
