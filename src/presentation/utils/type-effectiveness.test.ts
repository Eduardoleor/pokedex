import { PokemonType as T } from '@/domain/enums';

import { typeMatchups } from './type-effectiveness';

describe('typeMatchups', () => {
  it('lists weaknesses, resistances and immunities of a single type', () => {
    const { weak, resistant, immune } = typeMatchups([T.Fire]);

    expect(weak.map((item) => item.type).sort()).toEqual([T.Ground, T.Rock, T.Water].sort());
    expect(resistant).toEqual(
      expect.arrayContaining([T.Fire, T.Grass, T.Ice, T.Bug, T.Steel, T.Fairy]),
    );
    expect(immune).toEqual([]);
  });

  it('multiplies both types and puts 4x weaknesses first', () => {
    const { weak } = typeMatchups([T.Fire, T.Flying]);

    expect(weak[0]).toEqual({ type: T.Rock, multiplier: 4 });
    expect(weak.find((item) => item.type === T.Water)?.multiplier).toBe(2);
  });

  it('cancels a weakness against a resistance', () => {
    const { weak, resistant } = typeMatchups([T.Water, T.Flying]);
    const affected = [...weak.map((item) => item.type), ...resistant];

    // Grass is 2x against Water and 1/2x against Flying: neutral overall.
    expect(affected).not.toContain(T.Grass);
    expect(weak[0]).toEqual({ type: T.Electric, multiplier: 4 });
  });

  it('reports immunities', () => {
    expect(typeMatchups([T.Ghost]).immune).toEqual(expect.arrayContaining([T.Normal, T.Fighting]));
    expect(typeMatchups([T.Flying]).immune).toContain(T.Ground);
  });
});
