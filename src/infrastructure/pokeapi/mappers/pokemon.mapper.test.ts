import { ErrorKind } from '@/domain/errors';
import type { PokemonDto } from '@/infrastructure/pokeapi/dtos';

import { extractId, toPokemonDetail, toPokemonPage, toPokemonSummary } from './pokemon.mapper';

const resource = (name: string, id: number) => ({
  name,
  url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
});

function errorOf(action: () => unknown): unknown {
  try {
    action();
  } catch (cause) {
    return cause;
  }
  return undefined;
}

describe('extractId', () => {
  it('reads the id from a resource url, with or without a trailing slash', () => {
    expect(extractId('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
    expect(extractId('https://pokeapi.co/api/v2/pokemon/25')).toBe(25);
  });

  it('rejects urls without an id', () => {
    const error = errorOf(() => extractId('https://pokeapi.co/api/v2/pokemon/'));

    expect(error).toMatchObject({ kind: ErrorKind.InvalidResponse });
  });
});

describe('toPokemonSummary', () => {
  it('builds the artwork url from the id', () => {
    const summary = toPokemonSummary(resource('pikachu', 25));

    expect(summary.id).toBe(25);
    expect(summary.name).toBe('pikachu');
    expect(summary.imageUrl).toContain('/25.png');
  });
});

describe('toPokemonPage', () => {
  const dto = (
    next: string | null,
    count: number,
    results = [resource('a', 1), resource('b', 2)],
  ) => ({
    count,
    next,
    previous: null,
    results,
  });

  it('points to the next offset while there are more pages', () => {
    expect(toPokemonPage(dto('next', 10), { offset: 0, limit: 2 }).nextOffset).toBe(2);
  });

  it('has no next offset on the last page', () => {
    expect(toPokemonPage(dto(null, 2), { offset: 0, limit: 2 }).nextOffset).toBeNull();
    expect(toPokemonPage(dto('next', 2), { offset: 0, limit: 2 }).nextOffset).toBeNull();
  });
});

describe('toPokemonDetail', () => {
  const dto: PokemonDto = {
    id: 6,
    name: 'charizard',
    height: 17,
    weight: 905,
    base_experience: 267,
    sprites: { front_default: null, other: { 'official-artwork': { front_default: null } } },
    cries: { latest: 'https://cries/6.ogg', legacy: null },
    types: [
      { slot: 2, type: { name: 'flying', url: '' } },
      { slot: 1, type: { name: 'fire', url: '' } },
      { slot: 3, type: { name: 'unknown-type', url: '' } },
    ],
    abilities: [
      { slot: 3, is_hidden: true, ability: { name: 'solar-power', url: '' } },
      { slot: 1, is_hidden: false, ability: { name: 'blaze', url: '' } },
    ],
    stats: [
      { base_stat: 78, effort: 0, stat: { name: 'hp', url: '' } },
      { base_stat: 1, effort: 0, stat: { name: 'not-a-stat', url: '' } },
    ],
  };

  it('converts units and orders slots', () => {
    const detail = toPokemonDetail(dto);

    expect(detail.height).toBe(1.7);
    expect(detail.weight).toBe(90.5);
    expect(detail.types).toEqual(['fire', 'flying']);
    expect(detail.abilities.map((ability) => ability.name)).toEqual(['blaze', 'solar-power']);
    expect(detail.abilities[1]?.isHidden).toBe(true);
  });

  it('drops stats the app does not know and falls back to the generated artwork', () => {
    const detail = toPokemonDetail(dto);

    expect(detail.stats).toEqual([{ name: 'hp', value: 78 }]);
    expect(detail.imageUrl).toContain('/6.png');
    expect(detail.cryUrl).toBe('https://cries/6.ogg');
  });
});
