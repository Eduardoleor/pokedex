import { useEffect, useRef, useState } from 'react';
import { FlatList, type NativeScrollEvent, type NativeSyntheticEvent, View } from 'react-native';

import type { OnboardingStep } from '../../content/onboarding-steps';
import { useTheme } from '../../theme';
import { PageDots } from '../atoms';
import { InstructionCard } from '../molecules';

export interface InstructionsCarouselProps {
  steps: OnboardingStep[];
  index: number;
  onSelect: (index: number) => void;
  onInteraction: () => void;
}

export function InstructionsCarousel({
  steps,
  index,
  onSelect,
  onInteraction,
}: InstructionsCarouselProps) {
  const { theme } = useTheme();
  const listRef = useRef<FlatList<OnboardingStep>>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (width > 0) {
      listRef.current?.scrollToOffset({ offset: index * width, animated: true });
    }
  }, [index, width]);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) {
      onSelect(Math.round(event.nativeEvent.contentOffset.x / width));
    }
  };

  return (
    <View
      style={{ gap: theme.spacing.md }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          data={steps}
          keyExtractor={(step) => step.title}
          renderItem={({ item }) => <InstructionCard step={item} width={width} />}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onScrollBeginDrag={onInteraction}
          onMomentumScrollEnd={onMomentumEnd}
        />
      ) : null}
      <PageDots count={steps.length} active={index} />
    </View>
  );
}
