import type { QueryParams, QueryValue } from './types';

function encodePair(key: string, value: QueryValue): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
}

export function buildQueryString(params: QueryParams = {}): string {
  const pairs = Object.entries(params).flatMap(([key, value]) =>
    (Array.isArray(value) ? value : [value]).map((item) => encodePair(key, item)),
  );
  return pairs.filter((pair): pair is string => pair !== null).join('&');
}

export function buildUrl(baseUrl: string, path: string, params?: QueryParams): string {
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  const query = buildQueryString(params);

  if (!query) {
    return url;
  }
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}
