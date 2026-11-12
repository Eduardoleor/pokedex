import { DataSource } from '@/domain/enums';
import { AppError, ErrorKind } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';
import type { Cached, Page } from '@/domain/types';
import { RequestStatus } from '@/presentation/types';

import { initialListState, listReducer } from './list-reducer';

const pokemon = (id: number): PokemonSummary => ({
  id,
  name: `pokemon-${id}`,
  imageUrl: `https://img/${id}.png`,
});

function result(
  ids: number[],
  overrides: Partial<Cached<Page<PokemonSummary>>> = {},
  nextOffset: number | null = null,
): Cached<Page<PokemonSummary>> {
  return {
    data: { items: ids.map(pokemon), total: 100, nextOffset },
    source: DataSource.Network,
    updatedAt: 1000,
    isStale: false,
    error: null,
    ...overrides,
  };
}

describe('listReducer', () => {
  it('shows the loading status only for the initial request', () => {
    const initial = listReducer(initialListState, { type: 'start', mode: 'initial' });
    const more = listReducer(initialListState, { type: 'start', mode: 'more' });

    expect(initial.status).toBe(RequestStatus.Loading);
    expect(more.status).toBe(initialListState.status);
    expect(more.isLoadingMore).toBe(true);
  });

  it('replaces the list on the initial load and on refresh', () => {
    const loaded = listReducer(initialListState, {
      type: 'success',
      mode: 'initial',
      result: result([1, 2], {}, 2),
    });
    const refreshed = listReducer(loaded, {
      type: 'success',
      mode: 'refresh',
      result: result([5, 6], {}, 2),
    });

    expect(refreshed.items.map((item) => item.id)).toEqual([5, 6]);
    expect(refreshed.status).toBe(RequestStatus.Success);
  });

  it('appends the next page without duplicating items', () => {
    const first = listReducer(initialListState, {
      type: 'success',
      mode: 'initial',
      result: result([1, 2], {}, 2),
    });
    const next = listReducer(first, {
      type: 'success',
      mode: 'more',
      result: result([2, 3], {}, 4),
    });

    expect(next.items.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(next.nextOffset).toBe(4);
  });

  it('keeps the pages already loaded when the first page is revalidated', () => {
    const state = {
      ...initialListState,
      items: [1, 2, 3, 4].map(pokemon),
      nextOffset: 4,
      status: RequestStatus.Success,
    };
    const next = listReducer(state, {
      type: 'success',
      mode: 'revalidate',
      result: result([1, 2], {}, 2),
    });

    expect(next.items.map((item) => item.id)).toEqual([1, 2, 3, 4]);
    expect(next.nextOffset).toBe(4);
  });

  it('flags the list as offline when saved data was served after a network error', () => {
    const error = new AppError(ErrorKind.Network, 'offline');
    const next = listReducer(initialListState, {
      type: 'success',
      mode: 'initial',
      result: result([1], { source: DataSource.Cache, error }),
    });

    expect(next.isOffline).toBe(true);
    expect(next.error).toBe(error);
  });

  it('moves to the error status only when the initial request fails', () => {
    const error = new AppError(ErrorKind.Server, 'down');
    const initial = listReducer(initialListState, { type: 'failure', mode: 'initial', error });
    const more = listReducer(
      { ...initialListState, status: RequestStatus.Success },
      { type: 'failure', mode: 'more', error },
    );

    expect(initial.status).toBe(RequestStatus.Error);
    expect(more.status).toBe(RequestStatus.Success);
    expect(more.error).toBe(error);
    expect(more.isLoadingMore).toBe(false);
  });
});
