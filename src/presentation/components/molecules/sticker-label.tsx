import { StyleSheet, Text, View } from 'react-native';

import { wordmark } from '../../theme';

const OUTLINE = 1.5;
const OUTLINE_OFFSETS = [
  [-OUTLINE, 0],
  [OUTLINE, 0],
  [0, -OUTLINE],
  [0, OUTLINE],
  [-OUTLINE, -OUTLINE],
  [OUTLINE, OUTLINE],
  [-OUTLINE, OUTLINE],
  [OUTLINE, -OUTLINE],
] as const;

/**
 * Tilted text in the Pokémon wordmark colors. React Native has no text stroke, so the
 * outline is drawn with offset copies behind the fill.
 */
export function StickerLabel({ text }: { text: string }) {
  return (
    <View style={styles.sticker} accessible={false} importantForAccessibility="no-hide-descendants">
      <Text
        style={[styles.text, styles.layer, styles.depth]}
        numberOfLines={1}
        maxFontSizeMultiplier={1.2}
      >
        {text}
      </Text>
      {OUTLINE_OFFSETS.map(([x, y]) => (
        <Text
          key={`${x}:${y}`}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={[
            styles.text,
            styles.layer,
            styles.outline,
            { transform: [{ translateX: x }, { translateY: y }] },
          ]}
        >
          {text}
        </Text>
      ))}
      <Text style={[styles.text, styles.fill]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    transform: [{ rotate: '-6deg' }],
  },
  text: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  layer: {
    position: 'absolute',
  },
  depth: {
    color: wordmark.deepBlue,
    transform: [{ translateX: 1 }, { translateY: 3 }],
  },
  outline: {
    color: wordmark.blue,
  },
  fill: {
    color: wordmark.yellow,
  },
});
