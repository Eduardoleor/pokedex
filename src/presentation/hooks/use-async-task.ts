import { useCallback, useEffect, useReducer, useState } from 'react';

import { type AppError, ErrorKind, toAppError } from '@/domain/errors';

import { RequestStatus } from '../types';

export type AsyncTask<T> = (signal: AbortSignal) => Promise<T>;

interface AsyncState<T> {
  status: RequestStatus;
  data: T | undefined;
  error: AppError | null;
}

type AsyncAction<T> =
  { type: 'start' } | { type: 'success'; data: T } | { type: 'failure'; error: AppError };

function asyncReducer<T>(state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> {
  switch (action.type) {
    case 'start':
      return { ...state, status: RequestStatus.Loading, error: null };
    case 'success':
      return { status: RequestStatus.Success, data: action.data, error: null };
    case 'failure':
      return { ...state, status: RequestStatus.Error, error: action.error };
  }
}

/**
 * Runs `task` whenever it changes and aborts the previous run. Pass `null` to skip.
 * `task` must be stable between renders (wrap it in `useCallback`).
 */
export function useAsyncTask<T>(task: AsyncTask<T> | null) {
  const [state, dispatch] = useReducer(asyncReducer<T>, {
    status: RequestStatus.Idle,
    data: undefined,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!task) {
      return undefined;
    }
    const controller = new AbortController();
    dispatch({ type: 'start' });

    task(controller.signal)
      .then((data) => dispatch({ type: 'success', data }))
      .catch((error: unknown) => {
        const appError = toAppError(error);
        if (appError.kind !== ErrorKind.Cancelled) {
          dispatch({ type: 'failure', error: appError });
        }
      });

    return () => controller.abort();
  }, [task, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return {
    ...state,
    isLoading: state.status === RequestStatus.Loading,
    reload,
  };
}
