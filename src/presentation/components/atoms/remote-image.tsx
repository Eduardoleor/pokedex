import { Image, type ImageProps } from 'expo-image';

import { useTheme } from '../../theme';

export interface RemoteImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  accessibilityLabel: string;
}

/**
 * expo-image keeps downloaded images on disk, so artwork seen once is available offline.
 */
export function RemoteImage({ uri, style, ...rest }: RemoteImageProps) {
  const { theme } = useTheme();

  return (
    <Image
      source={{ uri }}
      cachePolicy="memory-disk"
      contentFit="contain"
      transition={200}
      accessible
      style={[{ backgroundColor: theme.colors.surfaceMuted }, style]}
      {...rest}
    />
  );
}
