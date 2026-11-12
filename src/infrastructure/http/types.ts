import type { HttpMethod } from '@/infrastructure/http/http-method';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type ResponseType = 'json' | 'text';

export interface RequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
  /** Overrides the client default. */
  timeoutMs?: number;
  /** Extra attempts after the first one. Only applied to idempotent methods. */
  retries?: number;
  /** Forces how the body is read; by default it is inferred from Content-Type. */
  responseType?: ResponseType;
  signal?: AbortSignal;
}

export interface HttpRequest<TBody = unknown> extends RequestOptions {
  method: HttpMethod;
  path: string;
  body?: TBody;
}

export interface HttpResponse<T> {
  status: number;
  headers: Headers;
  data: T;
}

export interface HttpClient {
  request<T, TBody = unknown>(request: HttpRequest<TBody>): Promise<HttpResponse<T>>;
  get<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>>;
  post<T, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>>;
  put<T, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>>;
  patch<T, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>>;
  delete<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>>;
}

export interface HttpClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  /** Base delay for exponential backoff between retries. */
  retryDelayMs?: number;
}
