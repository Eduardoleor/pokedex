import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';

import { useTheme } from '../../theme';
import { haptics } from '../../utils';
import { Icon, type IconName, Text } from '../atoms';

export interface FilterChip<T> {
  value: T;
  label: string;
  /** Colors of the chip once selected; defaults to the wordmark yellow. */
  activeColors?: { background: string; text: string };
}

export interface FilterChipsProps<T> {
  title: string;
  icon: IconName;
  chips: FilterChip<T>[];
  selected: T | null;
  /** Called with `null` when the selected chip is tapped again. */
  onSelect: (value: T | null) => void;
}

/** A titled, horizontally scrolling row of single-choice chips over the red band. */
export function FilterChips<T>({ title, icon, chips, selected, onSelect }: FilterChipsProps<T>) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View
        style={[styles.title, { gap: theme.spacing.xs, paddingHorizontal: theme.spacing.sm }]}
        accessibilityRole="header"
      >
        <SymbolView
          name={SYMBOLS[icon] ?? { ios: 'circle' }}
          size={15}
          weight="bold"
          tintColor={theme.colors.onHeader}
          fallback={<Icon name={icon} size={16} color={theme.colors.onHeader} />}
        />
        <Text variant="caption" style={{ color: theme.colors.onHeader, fontWeight: '800' }}>
          {title}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Bleeds to the band's edges so chips scroll out of view instead of being clipped.
        style={{ marginHorizontal: -theme.spacing.lg }}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}
      >
        {chips.map((chip) => {
          const active = chip.value === selected;
          const colors = chip.activeColors ?? {
            background: theme.colors.accent,
            text: '#1A1A1A',
          };
          return (
            <Pressable
              key={chip.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${title}: ${chip.label}`}
              onPress={() => {
                haptics.selection();
                onSelect(active ? null : chip.value);
              }}
              style={({ pressed }) => [
                styles.chip,
                {
                  borderRadius: theme.radius.pill,
                  paddingHorizontal: theme.spacing.md,
                  backgroundColor: active ? colors.background : 'rgba(255,255,255,0.16)',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: active ? colors.text : theme.colors.onHeader,
                  fontWeight: '700',
                }}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Native SF Symbols / Material Symbols for each section, the SVG icon as fallback. */
const SYMBOLS: Partial<Record<IconName, ComponentProps<typeof SymbolView>['name']>> = {
  layers: { ios: 'square.stack.3d.up.fill', android: 'layers', web: 'layers' },
  flame: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
};

const styles = StyleSheet.create({
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    minHeight: 34,
    justifyContent: 'center',
  },
});
