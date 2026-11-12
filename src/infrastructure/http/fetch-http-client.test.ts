import { ErrorKind } from '@/domain/errors';

import { FetchHttpClient } from './fetch-http-client';

function reply(status: number, body: unknown = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

describe('FetchHttpClient', () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
  const client = new FetchHttpClient({ baseUrl: 'https://api.test', retries: 2, retryDelayMs: 1 });

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  it('returns the parsed body and builds the url with query params', async () => {
    fetchMock.mockResolvedValue(reply(200, { ok: true }));

    const response = await client.get<{ ok: boolean }>('pokemon', {
      params: { limit: 20, offset: 0 },
    });

    expect(response.data).toEqual({ ok: true });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.test/pokemon?limit=20&offset=0');
  });

  it('maps a 404 to NotFound without retrying', async () => {
    fetchMock.mockResolvedValue(reply(404));

    await expect(client.get('pokemon/0')).rejects.toMatchObject({ kind: ErrorKind.NotFound });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries server errors and succeeds once the server recovers', async () => {
    fetchMock.mockResolvedValueOnce(reply(503)).mockResolvedValueOnce(reply(200, { n: 1 }));

    const response = await client.get<{ n: number }>('pokemon');

    expect(response.data.n).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up after the configured retries', async () => {
    fetchMock.mockResolvedValue(reply(500));

    await expect(client.get('pokemon')).rejects.toMatchObject({ kind: ErrorKind.Server });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('reports a failed connection as a Network error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(client.get('pokemon')).rejects.toMatchObject({ kind: ErrorKind.Network });
  });

  it('reports an aborted request as Cancelled and does not retry it', async () => {
    const controller = new AbortController();
    controller.abort();
    fetchMock.mockRejectedValue(new Error('aborted'));

    await expect(client.get('pokemon', { signal: controller.signal })).rejects.toMatchObject({
      kind: ErrorKind.Cancelled,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
