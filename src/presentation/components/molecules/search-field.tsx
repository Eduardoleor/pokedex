import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MIN_TOUCH_SIZE, useTheme } from '../../theme';
import { Icon } from '../atoms';

export interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

/** Pill search input; its outline turns wordmark yellow while a query is active. */
export function SearchField({ value, onChangeText, placeholder = 'Search' }: SearchFieldProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: theme.colors.surface,
          borderColor: value ? theme.colors.accent : 'transparent',
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <Icon name="search" size={18} tone={value ? 'primary' : 'textMuted'} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        returnKeyType="search"
        clearButtonMode="never"
        maxLength={40}
        accessibilityLabel="Search Pokémon by name or number"
        style={[theme.typography.body, styles.input, { color: theme.colors.textPrimary }]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
          onPress={() => onChangeText('')}
          style={[styles.clear, { backgroundColor: theme.colors.surfaceMuted }]}
        >
          <Icon name="close" size={14} tone="textSecondary" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: MIN_TOUCH_SIZE + 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  clear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
