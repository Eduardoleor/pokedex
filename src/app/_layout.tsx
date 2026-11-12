import { Stack } from 'expo-router';

import { DependenciesProvider } from '@/di';

export default function RootLayout() {
  return (
    <DependenciesProvider>
      <Stack />
    </DependenciesProvider>
  );
}
