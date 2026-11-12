import type { AppError } from '@/domain/errors';
import type { PokemonDetail } from '@/domain/models';
import type { Cached } from '@/domain/types';
import { isOfflineError } from '@/presentation/providers/pokemon-data/is-offline-error';
import { RequestStatus } from '@/presentation/types';

export interface DetailEntry {
  status: RequestStatus;
  data: PokemonDetail | undefined;
  error: AppError | null;
  isOffline: boolean;
  isStale: boolean;
  updatedAt: number | null;
}

export type DetailsState = Record<number, DetailEntry>;

export type DetailsAction =
  | { type: 'start'; id: number; silent: boolean }
  | { type: 'success'; id: number; result: Cached<PokemonDetail> }
  | { type: 'failure'; id: number; error: AppError };

export const emptyDetailEntry: DetailEntry = {
  status: RequestStatus.Idle,
  data: undefined,
  error: null,
  isOffline: false,
  isStale: false,
  updatedAt: null,
};

export function detailsReducer(state: DetailsState, action: DetailsAction): DetailsState {
  const current = state[action.id] ?? emptyDetailEntry;

  switch (action.type) {
    case 'start':
      if (action.silent && current.data) {
        return state;
      }
      return { ...state, [action.id]: { ...current, status: RequestStatus.Loading, error: null } };
    case 'success':
      return {
        ...state,
        [action.id]: {
          status: RequestStatus.Success,
          data: action.result.data,
          error: action.result.error,
          isOffline: isOfflineError(action.result.error),
          isStale: action.result.isStale,
          updatedAt: action.result.updatedAt,
        },
      };
    case 'failure':
      return {
        ...state,
        [action.id]: {
          ...current,
          status: current.data ? RequestStatus.Success : RequestStatus.Error,
          error: action.error,
          isOffline: isOfflineError(action.error),
        },
      };
  }
}
