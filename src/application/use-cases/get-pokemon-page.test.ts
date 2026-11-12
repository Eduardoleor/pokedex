import { FakeCacheStore } from '@/application/testing/fake-cache-store';
import { DataSource } from '@/domain/enums';
import { ErrorKind } from '@/domain/errors';
import type { PokemonRepository } from '@/domain/ports';

import { GetPokemonPage } from './get-pokemon-page';

function setup() {
  const getPage = jest.fn().mockResolvedValue({
    items: [{ id: 1, name: 'bulbasaur', imageUrl: 'img' }],
    total: 1,
    nextOffset: null,
  });
  const repository = { getPage } as unknown as PokemonRepository;
  return { getPage, useCase: new GetPokemonPage(repository, new FakeCacheStore()) };
}

function errorOf(action: () => unknown): unknown {
  try {
    action();
  } catch (cause) {
    return cause;
  }
  return undefined;
}

describe('GetPokemonPage', () => {
  it.each([
    [-1, 20],
    [1.5, 20],
    [0, 0],
    [0, 101],
  ])('rejects offset %p with limit %p', (offset, limit) => {
    const { useCase } = setup();

    const error = errorOf(() => useCase.execute({ offset, limit }));

    expect(error).toMatchObject({ kind: ErrorKind.Validation });
  });

  it('asks the repository once and then serves the page from the cache', async () => {
    const { getPage, useCase } = setup();

    const first = await useCase.execute({ offset: 0, limit: 20 });
    const second = await useCase.execute({ offset: 0, limit: 20 });

    expect(first.source).toBe(DataSource.Network);
    expect(second.source).toBe(DataSource.Cache);
    expect(getPage).toHaveBeenCalledTimes(1);
  });
});
