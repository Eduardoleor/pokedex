import { type AppError, ErrorKind } from '@/domain/errors';

export function getErrorMessage(error: AppError): string {
  switch (error.kind) {
    case ErrorKind.Network:
      return 'No internet connection. Check your network and try again.';
    case ErrorKind.Timeout:
      return 'The server is taking too long to respond. Please try again.';
    case ErrorKind.NotFound:
      return "We couldn't find that Pokémon.";
    case ErrorKind.Server:
      return 'PokéAPI is having trouble right now. Please try again later.';
    case ErrorKind.Cancelled:
    case ErrorKind.Client:
    case ErrorKind.Validation:
    case ErrorKind.InvalidResponse:
    case ErrorKind.Unknown:
      return 'Something went wrong. Please try again.';
  }
}
