import { ErrorKind } from '@/domain/errors/error-kind';

interface AppErrorOptions {
  status?: number;
  originalError?: unknown;
}

export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly status?: number;
  readonly originalError?: unknown;

  constructor(kind: ErrorKind, message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.status = options.status;
    this.originalError = options.originalError;
  }

  get isRetryable(): boolean {
    return (
      this.kind === ErrorKind.Network ||
      this.kind === ErrorKind.Timeout ||
      this.kind === ErrorKind.Server
    );
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return new AppError(ErrorKind.Unknown, message, { originalError: error });
}
