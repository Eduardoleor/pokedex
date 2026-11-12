import { AppError, ErrorKind } from '@/domain/errors';

import type { ResponseType } from './types';

const EMPTY_STATUSES = new Set([204, 205, 304]);

function inferResponseType(response: Response): ResponseType {
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('json') ? 'json' : 'text';
}

export async function parseResponse(
  response: Response,
  responseType?: ResponseType,
): Promise<unknown> {
  if (EMPTY_STATUSES.has(response.status)) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  if ((responseType ?? inferResponseType(response)) === 'text') {
    return text;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new AppError(ErrorKind.InvalidResponse, 'The server returned malformed JSON', {
      status: response.status,
      originalError: error,
    });
  }
}
