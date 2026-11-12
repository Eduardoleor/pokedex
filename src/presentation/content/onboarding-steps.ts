import type { IconName } from '../components/atoms';

export interface OnboardingStep {
  icon: IconName;
  title: string;
  body: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: 'pokeball',
    title: 'Your Pokedex, ready to go',
    body: 'We are saving the first Pokémon on your device while you read this.',
  },
  {
    icon: 'search',
    title: 'Scroll to discover',
    body: 'The list keeps loading as you scroll. Pull down any time to refresh it.',
  },
  {
    icon: 'wifi-off',
    title: 'Works offline',
    body: 'Everything you have seen stays available without a connection and updates itself later.',
  },
  {
    icon: 'volume',
    title: 'Hear their cry',
    body: 'Open a Pokémon and tap “Play cry”. Once played, it works offline too.',
  },
  {
    icon: 'device',
    title: 'Light or dark',
    body: 'The app follows your system theme. Use the button in the header to choose one.',
  },
];
