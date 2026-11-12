import type { PokemonType } from '@/domain/enums';
import { Badge } from '@/presentation/components/atoms';
import { typeColors } from '@/presentation/theme';
import { formatName } from '@/presentation/utils';

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
