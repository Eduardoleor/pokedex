import { AppError, ErrorKind } from '@/domain/errors';

function kindFromStatus(status: number): ErrorKind {
  if (status === 404) {
    return ErrorKind.NotFound;
  }
  if (status === 408) {
    return ErrorKind.Timeout;
  }
  if (status === 429 || status >= 500) {
    return ErrorKind.Server;
  }
  return ErrorKind.Client;
}

export function errorFromStatus(status: number, url: string, data: unknown): AppError {
  return new AppError(kindFromStatus(status), `Request to ${url} failed with status ${status}`, {
    status,
    originalError: data,
  });
}
