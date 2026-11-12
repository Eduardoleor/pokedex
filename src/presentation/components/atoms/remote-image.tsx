import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Image, type ImageProps } from 'expo-image';

import { Icon } from '@/presentation/components/atoms/icon';
import { useTheme } from '@/presentation/theme';

export interface RemoteImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  accessibilityLabel: string;
}

/**
 * expo-image keeps downloaded images on disk, so artwork seen once is available offline.
 * When an image can neither be downloaded nor found on disk, a Poké Ball stands in for it.
 */
export function RemoteImage({ uri, style, onError, ...rest }: RemoteImageProps) {
  const { theme } = useTheme();
  // Remembering which address failed means a new address gets a fresh attempt.
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const failed = failedUri === uri;

  if (failed) {
    return (
      <View
        accessible
        accessibilityLabel={rest.accessibilityLabel}
        style={[{ backgroundColor: theme.colors.surfaceMuted }, styles.fallback, style]}
      >
        <Icon name="pokeball" size={32} tone="textMuted" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      cachePolicy="memory-disk"
      contentFit="contain"
      transition={200}
      accessible
      style={[{ backgroundColor: theme.colors.surfaceMuted }, style]}
      onError={(event) => {
        setFailedUri(uri);
        onError?.(event);
      }}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
});
