import { AppError, ErrorKind, isAppError, toAppError } from '@/domain/errors';
import { buildUrl } from '@/infrastructure/http/build-url';
import { HttpMethod, isIdempotent } from '@/infrastructure/http/http-method';
import { parseResponse } from '@/infrastructure/http/parse-response';
import { errorFromStatus } from '@/infrastructure/http/status-error';
import type {
  HttpClient,
  HttpClientConfig,
  HttpRequest,
  HttpResponse,
  RequestOptions,
} from '@/infrastructure/http/types';

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

function cancelledError(): AppError {
  return new AppError(ErrorKind.Cancelled, 'Request was cancelled');
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(cancelledError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(cancelledError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort);
  });
}

function serializeBody(body: unknown): { payload?: BodyInit; isJson: boolean } {
  if (body === undefined || body === null) {
    return { isJson: false };
  }
  if (typeof body === 'string' || body instanceof FormData) {
    return { payload: body, isJson: false };
  }
  return { payload: JSON.stringify(body), isJson: true };
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly retryDelayMs: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.headers = { Accept: 'application/json', ...config.headers };
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = config.retries ?? DEFAULT_RETRIES;
    this.retryDelayMs = config.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  }

  async request<T, TBody = unknown>(request: HttpRequest<TBody>): Promise<HttpResponse<T>> {
    const maxRetries = isIdempotent(request.method) ? (request.retries ?? this.retries) : 0;

    for (let attempt = 0; ; attempt++) {
      try {
        return await this.send<T, TBody>(request);
      } catch (error) {
        const appError = toAppError(error);
        if (attempt >= maxRetries || !appError.isRetryable) {
          throw appError;
        }
        await wait(this.retryDelayMs * 2 ** attempt, request.signal);
      }
    }
  }

  get<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>({ ...options, method: HttpMethod.Get, path });
  }

  post<T, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T, TBody>({ ...options, method: HttpMethod.Post, path, body });
  }

  put<T, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T, TBody>({ ...options, method: HttpMethod.Put, path, body });
  }

  patch<T, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T, TBody>({ ...options, method: HttpMethod.Patch, path, body });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>({ ...options, method: HttpMethod.Delete, path });
  }

  private async send<T, TBody>(request: HttpRequest<TBody>): Promise<HttpResponse<T>> {
    const { method, path, params, headers, body, timeoutMs, responseType, signal } = request;
    const url = buildUrl(this.baseUrl, path, params);
    const { payload, isJson } = serializeBody(body);

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs ?? this.timeoutMs);
    const onAbort = () => controller.abort();

    if (signal?.aborted) {
      controller.abort();
    } else {
      signal?.addEventListener('abort', onAbort);
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.headers,
          ...(isJson ? { 'Content-Type': 'application/json' } : {}),
          ...headers,
        },
        body: payload,
        signal: controller.signal,
      });
      const data = await parseResponse(response, responseType);

      if (!response.ok) {
        throw errorFromStatus(response.status, url, data);
      }
      return { status: response.status, headers: response.headers, data: data as T };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      if (controller.signal.aborted) {
        throw timedOut
          ? new AppError(ErrorKind.Timeout, `Request to ${url} timed out`, { originalError: error })
          : cancelledError();
      }
      throw new AppError(ErrorKind.Network, `Network request to ${url} failed`, {
        originalError: error,
      });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
}
