import { useWindowDimensions } from 'react-native';

export function useGridColumns(): number {
  const { width } = useWindowDimensions();
  if (width >= 900) {
    return 5;
  }
  if (width >= 600) {
    return 3;
  }
  return 2;
}
