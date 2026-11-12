import { type AppError, ErrorKind } from '@/domain/errors';

export function isOfflineError(error: AppError | null | undefined): boolean {
  return error?.kind === ErrorKind.Network || error?.kind === ErrorKind.Timeout;
}
