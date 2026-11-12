/** Development-only previews of the onboarding, opened with `/onboarding?preview=<mode>`. */
export enum OnboardingPreview {
  /** Replays the first load: one Pokémon arrives every few hundred milliseconds. */
  Loading = 'loading',
  /** First launch without a connection. */
  Offline = 'offline',
}

const previews = new Set<string>(Object.values(OnboardingPreview));

export function toOnboardingPreview(value: unknown): OnboardingPreview | undefined {
  return typeof value === 'string' && previews.has(value)
    ? (value as OnboardingPreview)
    : undefined;
}
