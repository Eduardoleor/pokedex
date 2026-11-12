import type { AppError } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';
import type { Cached, Page } from '@/domain/types';

import { RequestStatus } from '../../types';
import { isOfflineError } from './is-offline-error';

export type ListLoadMode = 'initial' | 'refresh' | 'more' | 'revalidate';

export interface ListState {
  items: PokemonSummary[];
  total: number;
  nextOffset: number | null;
  status: RequestStatus;
  error: AppError | null;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  /** A silent background refresh is running. */
  isRevalidating: boolean;
  /** The last request could not reach the network. */
  isOffline: boolean;
  /** The first page came from a cache entry older than the TTL. */
  isStale: boolean;
  updatedAt: number | null;
}

export type ListAction =
  | { type: 'start'; mode: ListLoadMode }
  | { type: 'success'; mode: ListLoadMode; result: Cached<Page<PokemonSummary>> }
  | { type: 'failure'; mode: ListLoadMode; error: AppError };

export const initialListState: ListState = {
  items: [],
  total: 0,
  nextOffset: 0,
  status: RequestStatus.Idle,
  error: null,
  isRefreshing: false,
  isLoadingMore: false,
  isRevalidating: false,
  isOffline: false,
  isStale: false,
  updatedAt: null,
};

function mergeItems(
  current: PokemonSummary[],
  incoming: PokemonSummary[],
  mode: ListLoadMode,
): PokemonSummary[] {
  if (mode === 'initial' || mode === 'refresh') {
    return incoming;
  }
  if (mode === 'revalidate') {
    // Fresh first page replaces the head; pages already loaded below are kept.
    const ids = new Set(incoming.map((item) => item.id));
    return [...incoming, ...current.filter((item) => !ids.has(item.id))];
  }
  const ids = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !ids.has(item.id))];
}

export function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        error: action.mode === 'revalidate' ? state.error : null,
        status: action.mode === 'initial' ? RequestStatus.Loading : state.status,
        isRefreshing: action.mode === 'refresh',
        isLoadingMore: action.mode === 'more',
        isRevalidating: action.mode === 'revalidate',
      };
    case 'success': {
      const { data, error, updatedAt } = action.result;
      const keepsPagination = action.mode === 'revalidate' || action.mode === 'more';
      return {
        items: mergeItems(state.items, data.items, action.mode),
        total: data.total,
        nextOffset:
          action.mode === 'revalidate' && state.items.length > data.items.length
            ? state.nextOffset
            : data.nextOffset,
        status: RequestStatus.Success,
        error,
        isRefreshing: false,
        isLoadingMore: false,
        isRevalidating: false,
        isOffline: isOfflineError(error),
        isStale: action.mode === 'more' ? state.isStale : action.result.isStale,
        updatedAt:
          keepsPagination && state.updatedAt !== null
            ? Math.min(state.updatedAt, updatedAt)
            : updatedAt,
      };
    }
    case 'failure':
      return {
        ...state,
        error: action.error,
        status: action.mode === 'initial' ? RequestStatus.Error : state.status,
        isRefreshing: false,
        isLoadingMore: false,
        isRevalidating: false,
        isOffline: isOfflineError(action.error),
      };
  }
}
