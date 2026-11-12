import type { PokemonType } from '@/domain/enums';

import { typeColors } from '../../theme';
import { formatName } from '../../utils';
import { Badge } from '../atoms';

export function TypeBadge({ type }: { type: PokemonType }) {
  const colors = typeColors[type];
  return (
    <Badge
      label={formatName(type)}
      backgroundColor={colors.background}
      textColor={colors.text}
      accessibilityLabel={`${formatName(type)} type`}
    />
  );
}
