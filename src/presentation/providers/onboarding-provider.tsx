import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as SplashScreen from 'expo-splash-screen';

import { useDependencies } from '@/di';

import { OnboardingStatus } from '../types';

const COMPLETED_KEY = 'onboarding-completed';

interface OnboardingContextValue {
  status: OnboardingStatus;
  complete: () => void;
  /** Set right after the catch so the home screen plays the Poké Ball opening. */
  isRevealPending: boolean;
  requestReveal: () => void;
  finishReveal: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { preferences } = useDependencies();
  const [status, setStatus] = useState(OnboardingStatus.Loading);

  useEffect(() => {
    let active = true;
    preferences
      .get<boolean>(COMPLETED_KEY)
      .then((saved) => {
        if (active) {
          setStatus(saved?.value === true ? OnboardingStatus.Completed : OnboardingStatus.Pending);
        }
      })
      .catch(() => active && setStatus(OnboardingStatus.Pending));
    return () => {
      active = false;
    };
  }, [preferences]);

  // The native splash covers the app until we know which screen comes first.
  useEffect(() => {
    if (status !== OnboardingStatus.Loading) {
      SplashScreen.hide();
    }
  }, [status]);

  const complete = useCallback(() => {
    setStatus(OnboardingStatus.Completed);
    preferences.set(COMPLETED_KEY, true).catch(() => undefined);
  }, [preferences]);

  const [isRevealPending, setIsRevealPending] = useState(false);
  const requestReveal = useCallback(() => setIsRevealPending(true), []);
  const finishReveal = useCallback(() => setIsRevealPending(false), []);

  const value = useMemo(
    () => ({ status, complete, isRevealPending, requestReveal, finishReveal }),
    [status, complete, isRevealPending, requestReveal, finishReveal],
  );

  return <OnboardingContext value={value}>{children}</OnboardingContext>;
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  }
  return context;
}
