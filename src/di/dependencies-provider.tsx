import { createContext, type ReactNode, useContext, useState } from 'react';

import { createDependencies, type Dependencies } from '@/di/container';

const DependenciesContext = createContext<Dependencies | null>(null);

interface DependenciesProviderProps {
  children: ReactNode;
  /** Lets tests and previews inject fakes instead of the real adapters. */
  value?: Dependencies;
}

export function DependenciesProvider({ children, value }: DependenciesProviderProps) {
  const [dependencies] = useState(() => value ?? createDependencies());
  return <DependenciesContext value={dependencies}>{children}</DependenciesContext>;
}

export function useDependencies(): Dependencies {
  const dependencies = useContext(DependenciesContext);
  if (!dependencies) {
    throw new Error('useDependencies must be used inside <DependenciesProvider>');
  }
  return dependencies;
}
