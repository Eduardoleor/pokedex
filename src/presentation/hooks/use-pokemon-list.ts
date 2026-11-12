import { useCallback, useEffect, useReducer, useRef } from 'react';

import { useDependencies } from '@/di';
import { type AppError, ErrorKind, toAppError } from '@/domain/errors';
import type { PokemonSummary } from '@/domain/models';
import type { Page } from '@/domain/types';

import { RequestStatus } from '../types';

export const DEFAULT_PAGE_SIZE = 20;

type LoadMode = 'initial' | 'refresh' | 'more';

interface ListState {
  items: PokemonSummary[];
  total: number;
  nextOffset: number | null;
  status: RequestStatus;
  error: AppError | null;
  isRefreshing: boolean;
  isLoadingMore: boolean;
}

type ListAction =
  | { type: 'start'; mode: LoadMode }
  | { type: 'success'; mode: LoadMode; page: Page<PokemonSummary> }
  | { type: 'failure'; mode: LoadMode; error: AppError };

const initialState: ListState = {
  items: [],
  total: 0,
  nextOffset: 0,
  status: RequestStatus.Idle,
  error: null,
  isRefreshing: false,
  isLoadingMore: false,
};

function appendUnique(current: PokemonSummary[], next: PokemonSummary[]): PokemonSummary[] {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...next.filter((item) => !seen.has(item.id))];
}

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        error: null,
        status: action.mode === 'initial' ? RequestStatus.Loading : state.status,
        isRefreshing: action.mode === 'refresh',
        isLoadingMore: action.mode === 'more',
      };
    case 'success':
      return {
        items:
          action.mode === 'more' ? appendUnique(state.items, action.page.items) : action.page.items,
        total: action.page.total,
        nextOffset: action.page.nextOffset,
        status: RequestStatus.Success,
        error: null,
        isRefreshing: false,
        isLoadingMore: false,
      };
    case 'failure':
      return {
        ...state,
        error: action.error,
        status: action.mode === 'initial' ? RequestStatus.Error : state.status,
        isRefreshing: false,
        isLoadingMore: false,
      };
  }
}

export function usePokemonList(pageSize = DEFAULT_PAGE_SIZE) {
  const { getPokemonPage } = useDependencies();
  const [state, dispatch] = useReducer(listReducer, initialState);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (mode: LoadMode, offset: number) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      dispatch({ type: 'start', mode });

      try {
        const page = await getPokemonPage.execute({ offset, limit: pageSize }, controller.signal);
        dispatch({ type: 'success', mode, page });
      } catch (error) {
        const appError = toAppError(error);
        if (appError.kind !== ErrorKind.Cancelled) {
          dispatch({ type: 'failure', mode, error: appError });
        }
      }
    },
    [getPokemonPage, pageSize],
  );

  useEffect(() => {
    void load('initial', 0);
    return () => controllerRef.current?.abort();
  }, [load]);

  const busy = state.status === RequestStatus.Loading || state.isRefreshing || state.isLoadingMore;

  const loadMore = useCallback(() => {
    if (busy || state.nextOffset === null || state.status !== RequestStatus.Success) {
      return;
    }
    void load('more', state.nextOffset);
  }, [busy, load, state.nextOffset, state.status]);

  const refresh = useCallback(() => {
    void load(state.items.length > 0 ? 'refresh' : 'initial', 0);
  }, [load, state.items.length]);

  const retry = useCallback(() => {
    if (state.items.length === 0) {
      void load('initial', 0);
    } else if (state.nextOffset !== null) {
      void load('more', state.nextOffset);
    }
  }, [load, state.items.length, state.nextOffset]);

  return {
    ...state,
    isLoading: state.status === RequestStatus.Loading,
    hasMore: state.nextOffset !== null,
    loadMore,
    refresh,
    retry,
  };
}
