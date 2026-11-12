import { View } from 'react-native';

import type { OnboardingStep } from '../../content/onboarding-steps';
import { useTheme } from '../../theme';
import { Icon, Text } from '../atoms';

export function InstructionCard({ step, width }: { step: OnboardingStep; width: number }) {
  const { theme } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${step.title}. ${step.body}`}
      style={{
        width,
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xl,
      }}
    >
      <Icon name={step.icon} size={32} tone="primary" />
      <Text variant="heading" align="center">
        {step.title}
      </Text>
      <Text tone="textSecondary" align="center">
        {step.body}
      </Text>
    </View>
  );
}
