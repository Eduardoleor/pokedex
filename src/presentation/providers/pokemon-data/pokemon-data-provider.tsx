import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { DEFAULT_CACHE_POLICY } from '@/application/cache';
import { useDependencies } from '@/di';
import { ErrorKind, toAppError } from '@/domain/errors';

import { RequestStatus } from '../../types';
import { detailsReducer, type DetailsState } from './details-reducer';
import { initialListState, type ListLoadMode, listReducer, type ListState } from './list-reducer';
import { prefetchDetails } from './prefetch-details';

export const PAGE_SIZE = 20;
const OFFLINE_RETRY_MS = 30_000;

export interface PokemonListContextValue extends ListState {
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  retry: () => void;
}

interface PokemonDetailsContextValue {
  details: DetailsState;
  /** Ids whose detail and artwork are saved on the device. */
  savedIds: ReadonlySet<number>;
  loadDetail: (id: number, options?: { silent?: boolean }) => void;
}

const PokemonListContext = createContext<PokemonListContextValue | null>(null);
const PokemonDetailsContext = createContext<PokemonDetailsContextValue | null>(null);

export function PokemonDataProvider({ children }: { children: ReactNode }) {
  const { getPokemonPage, getPokemonDetail } = useDependencies();
  const [list, dispatchList] = useReducer(listReducer, initialListState);
  const [details, dispatchDetails] = useReducer(detailsReducer, {});
  const [savedIds, setSavedIds] = useState<ReadonlySet<number>>(() => new Set());

  const listRequest = useRef<{ controller: AbortController; mode: ListLoadMode } | null>(null);
  const detailRequests = useRef(new Map<number, AbortController>());
  const prefetched = useRef(new Set<number>());
  const listRef = useRef(list);

  useEffect(() => {
    listRef.current = list;
  }, [list]);

  const loadPage = useCallback(
    async (mode: ListLoadMode, offset: number) => {
      // A background refresh never interrupts a request the user started.
      if (mode === 'revalidate' && listRequest.current) {
        return;
      }
      listRequest.current?.controller.abort();
      const controller = new AbortController();
      listRequest.current = { controller, mode };
      dispatchList({ type: 'start', mode });

      try {
        const result = await getPokemonPage.execute(
          { offset, limit: PAGE_SIZE },
          { signal: controller.signal, forceRefresh: mode === 'refresh' || mode === 'revalidate' },
        );
        dispatchList({ type: 'success', mode, result });
      } catch (error) {
        const appError = toAppError(error);
        if (appError.kind !== ErrorKind.Cancelled) {
          dispatchList({ type: 'failure', mode, error: appError });
        }
      } finally {
        if (listRequest.current?.controller === controller) {
          listRequest.current = null;
        }
      }
    },
    [getPokemonPage],
  );

  const loadDetail = useCallback(
    async (id: number, { silent = false }: { silent?: boolean } = {}) => {
      if (silent && detailRequests.current.has(id)) {
        return;
      }
      detailRequests.current.get(id)?.abort();
      const controller = new AbortController();
      detailRequests.current.set(id, controller);
      dispatchDetails({ type: 'start', id, silent });

      try {
        const result = await getPokemonDetail.execute(id, {
          signal: controller.signal,
          forceRefresh: silent,
        });
        dispatchDetails({ type: 'success', id, result });
      } catch (error) {
        const appError = toAppError(error);
        if (appError.kind !== ErrorKind.Cancelled) {
          dispatchDetails({ type: 'failure', id, error: appError });
        }
      } finally {
        if (detailRequests.current.get(id) === controller) {
          detailRequests.current.delete(id);
        }
      }
    },
    [getPokemonDetail],
  );

  // First load: saved data shows up immediately, the network fills the gaps.
  useEffect(() => {
    void loadPage('initial', 0);
    const requests = detailRequests.current;
    return () => {
      listRequest.current?.controller.abort();
      requests.forEach((controller) => controller.abort());
    };
  }, [loadPage]);

  // Saved first page older than the TTL: refresh it without any visible loading state.
  useEffect(() => {
    if (list.isStale && !list.error && !list.isRevalidating) {
      void loadPage('revalidate', 0);
    }
  }, [list.isStale, list.error, list.isRevalidating, loadPage]);

  // While offline with saved data on screen, retry quietly every 30 s.
  useEffect(() => {
    if (!list.isOffline || list.items.length === 0) {
      return undefined;
    }
    const timer = setInterval(() => void loadPage('revalidate', 0), OFFLINE_RETRY_MS);
    return () => clearInterval(timer);
  }, [list.isOffline, list.items.length, loadPage]);

  // Coming back to the app: revalidate if we were offline or the data expired.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const { isOffline, updatedAt, items } = listRef.current;
      const expired =
        updatedAt !== null && DEFAULT_CACHE_POLICY.now() - updatedAt >= DEFAULT_CACHE_POLICY.ttlMs;
      if (state === 'active' && items.length > 0 && (isOffline || expired)) {
        void loadPage('revalidate', 0);
      }
    });
    return () => subscription.remove();
  }, [loadPage]);

  // Save details of the visible Pokémon in the background so they work offline.
  useEffect(() => {
    if (list.isOffline) {
      return undefined;
    }
    const started = prefetched.current;
    const pending = list.items.filter((item) => !started.has(item.id));
    if (pending.length === 0) {
      return undefined;
    }
    pending.forEach((item) => started.add(item.id));
    const finished = new Set<number>();
    const controller = new AbortController();
    void prefetchDetails(pending, getPokemonDetail, controller.signal, (id) => {
      finished.add(id);
      setSavedIds((current) => (current.has(id) ? current : new Set(current).add(id)));
    });
    return () => {
      controller.abort();
      // Let a later run pick up whatever this one did not finish.
      pending.forEach((item) => !finished.has(item.id) && started.delete(item.id));
    };
  }, [list.items, list.isOffline, getPokemonDetail]);

  const busy = list.status === RequestStatus.Loading || list.isRefreshing || list.isLoadingMore;

  const loadMore = useCallback(() => {
    if (busy || list.nextOffset === null || list.status !== RequestStatus.Success) {
      return;
    }
    void loadPage('more', list.nextOffset);
  }, [busy, list.nextOffset, list.status, loadPage]);

  const refresh = useCallback(() => {
    void loadPage(list.items.length > 0 ? 'refresh' : 'initial', 0);
  }, [list.items.length, loadPage]);

  const retry = useCallback(() => {
    if (list.items.length === 0) {
      void loadPage('initial', 0);
    } else if (list.nextOffset !== null) {
      void loadPage('more', list.nextOffset);
    }
  }, [list.items.length, list.nextOffset, loadPage]);

  const listValue = useMemo<PokemonListContextValue>(
    () => ({
      ...list,
      isLoading: list.status === RequestStatus.Loading,
      hasMore: list.nextOffset !== null,
      loadMore,
      refresh,
      retry,
    }),
    [list, loadMore, refresh, retry],
  );

  const detailsValue = useMemo<PokemonDetailsContextValue>(
    () => ({ details, savedIds, loadDetail: (id, options) => void loadDetail(id, options) }),
    [details, savedIds, loadDetail],
  );

  return (
    <PokemonListContext value={listValue}>
      <PokemonDetailsContext value={detailsValue}>{children}</PokemonDetailsContext>
    </PokemonListContext>
  );
}

export function usePokemonListContext(): PokemonListContextValue {
  const context = useContext(PokemonListContext);
  if (!context) {
    throw new Error('usePokemonList must be used inside <PokemonDataProvider>');
  }
  return context;
}

export function usePokemonDetailsContext(): PokemonDetailsContextValue {
  const context = useContext(PokemonDetailsContext);
  if (!context) {
    throw new Error('usePokemonDetail must be used inside <PokemonDataProvider>');
  }
  return context;
}
