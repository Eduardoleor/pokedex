import { PokemonType as T } from '@/domain/enums';

/** Attacking type → defending types it hits for 2×, ½× and 0×. */
const CHART: Record<T, { double: T[]; half: T[]; none: T[] }> = {
  [T.Normal]: { double: [], half: [T.Rock, T.Steel], none: [T.Ghost] },
  [T.Fire]: {
    double: [T.Grass, T.Ice, T.Bug, T.Steel],
    half: [T.Fire, T.Water, T.Rock, T.Dragon],
    none: [],
  },
  [T.Water]: { double: [T.Fire, T.Ground, T.Rock], half: [T.Water, T.Grass, T.Dragon], none: [] },
  [T.Electric]: {
    double: [T.Water, T.Flying],
    half: [T.Electric, T.Grass, T.Dragon],
    none: [T.Ground],
  },
  [T.Grass]: {
    double: [T.Water, T.Ground, T.Rock],
    half: [T.Fire, T.Grass, T.Poison, T.Flying, T.Bug, T.Dragon, T.Steel],
    none: [],
  },
  [T.Ice]: {
    double: [T.Grass, T.Ground, T.Flying, T.Dragon],
    half: [T.Fire, T.Water, T.Ice, T.Steel],
    none: [],
  },
  [T.Fighting]: {
    double: [T.Normal, T.Ice, T.Rock, T.Dark, T.Steel],
    half: [T.Poison, T.Flying, T.Psychic, T.Bug, T.Fairy],
    none: [T.Ghost],
  },
  [T.Poison]: {
    double: [T.Grass, T.Fairy],
    half: [T.Poison, T.Ground, T.Rock, T.Ghost],
    none: [T.Steel],
  },
  [T.Ground]: {
    double: [T.Fire, T.Electric, T.Poison, T.Rock, T.Steel],
    half: [T.Grass, T.Bug],
    none: [T.Flying],
  },
  [T.Flying]: {
    double: [T.Grass, T.Fighting, T.Bug],
    half: [T.Electric, T.Rock, T.Steel],
    none: [],
  },
  [T.Psychic]: { double: [T.Fighting, T.Poison], half: [T.Psychic, T.Steel], none: [T.Dark] },
  [T.Bug]: {
    double: [T.Grass, T.Psychic, T.Dark],
    half: [T.Fire, T.Fighting, T.Poison, T.Flying, T.Ghost, T.Steel, T.Fairy],
    none: [],
  },
  [T.Rock]: {
    double: [T.Fire, T.Ice, T.Flying, T.Bug],
    half: [T.Fighting, T.Ground, T.Steel],
    none: [],
  },
  [T.Ghost]: { double: [T.Psychic, T.Ghost], half: [T.Dark], none: [T.Normal] },
  [T.Dragon]: { double: [T.Dragon], half: [T.Steel], none: [T.Fairy] },
  [T.Dark]: { double: [T.Psychic, T.Ghost], half: [T.Fighting, T.Dark, T.Fairy], none: [] },
  [T.Steel]: {
    double: [T.Ice, T.Rock, T.Fairy],
    half: [T.Fire, T.Water, T.Electric, T.Steel],
    none: [],
  },
  [T.Fairy]: {
    double: [T.Fighting, T.Dragon, T.Dark],
    half: [T.Fire, T.Poison, T.Steel],
    none: [],
  },
};

export interface TypeMatchups {
  /** Attacking types and their multiplier (2 or 4). */
  weak: { type: T; multiplier: number }[];
  resistant: T[];
  immune: T[];
}

/** How every attacking type fares against a Pokémon with these (one or two) types. */
export function typeMatchups(defending: T[]): TypeMatchups {
  const result: TypeMatchups = { weak: [], resistant: [], immune: [] };
  for (const attacker of Object.values(T)) {
    const row = CHART[attacker];
    const multiplier = defending.reduce(
      (total, type) =>
        total *
        (row.none.includes(type)
          ? 0
          : row.double.includes(type)
            ? 2
            : row.half.includes(type)
              ? 0.5
              : 1),
      1,
    );
    if (multiplier === 0) {
      result.immune.push(attacker);
    } else if (multiplier > 1) {
      result.weak.push({ type: attacker, multiplier });
    } else if (multiplier < 1) {
      result.resistant.push(attacker);
    }
  }
  result.weak.sort((a, b) => b.multiplier - a.multiplier);
  return result;
}
