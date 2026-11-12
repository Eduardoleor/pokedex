export enum StatName {
  Hp = 'hp',
  Attack = 'attack',
  Defense = 'defense',
  SpecialAttack = 'special-attack',
  SpecialDefense = 'special-defense',
  Speed = 'speed',
}

const statNames = new Set<string>(Object.values(StatName));

export function isStatName(value: string): value is StatName {
  return statNames.has(value);
}
