import { StyleSheet, View } from 'react-native';

import { Image } from 'expo-image';

import { pokeball, wordmark } from '../../theme';

const TRAINER = require('../../../../assets/images/trainer.svg') as number;

/** Size of the artwork's own canvas, so crops stay proportional. */
const ART_WIDTH = 273.32;
const ART_HEIGHT = 517.56;
/** Circle around the head and cap, in artwork units. */
const FACE = { x: 94, y: 98, radius: 88 };

export interface TrainerAvatarProps {
  size: number;
}

/** The trainer's head inside a round badge, cropped from the full-body artwork. */
export function TrainerAvatar({ size }: TrainerAvatarProps) {
  const border = Math.max(2, size * 0.05);
  const inner = size - border * 2;
  const scale = inner / (FACE.radius * 2);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, borderWidth: border },
      ]}
    >
      <Image
        source={TRAINER}
        contentFit="fill"
        style={{
          position: 'absolute',
          width: ART_WIDTH * scale,
          height: ART_HEIGHT * scale,
          left: -(FACE.x - FACE.radius) * scale,
          top: -(FACE.y - FACE.radius) * scale,
        }}
      />
    </View>
  );
}

export interface TrainerPortraitProps {
  height: number;
}

/** The trainer standing, full body. */
export function TrainerPortrait({ height }: TrainerPortraitProps) {
  return (
    <Image
      source={TRAINER}
      contentFit="contain"
      accessibilityElementsHidden
      style={{ height, width: (height * ART_WIDTH) / ART_HEIGHT }}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: wordmark.yellow,
    borderColor: pokeball.white,
    overflow: 'hidden',
  },
});
