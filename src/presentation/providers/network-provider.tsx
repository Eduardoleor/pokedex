import { createContext, type ReactNode, useContext, useMemo } from 'react';

import { useNetworkState } from 'expo-network';

interface NetworkContextValue {
  /** The device reports no connection. Unknown (still checking) counts as online. */
  isOffline: boolean;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

/** Live connectivity of the device. It only informs the UI, nothing is ever blocked by it. */
export function NetworkProvider({ children }: { children: ReactNode }) {
  const { isConnected, isInternetReachable } = useNetworkState();
  const isOffline = isConnected === false || isInternetReachable === false;
  const value = useMemo(() => ({ isOffline }), [isOffline]);

  return <NetworkContext value={value}>{children}</NetworkContext>;
}

export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used inside <NetworkProvider>');
  }
  return context;
}
