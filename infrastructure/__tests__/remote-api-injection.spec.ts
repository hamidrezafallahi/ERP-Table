import { describe, expect, it, vi } from 'vitest';

import { CallbackRemoteApi } from '../Repositories/callbackRemoteApi';
import { FetchRemoteApi } from '../Repositories/fetchRemoteApi';

describe('CallbackRemoteApi', () => {
  it('delegates to the host transport and returns its payload', async () => {
    const send = vi.fn(async () => ({ Result: 'Success', Data: [1] }));
    const api = new CallbackRemoteApi(send);
    const out = await api.request<{ Data: number[] }>({
      endpoint: '/api/x',
      params: { a: 1 },
    });
    expect(out.Data).toEqual([1]);
    expect(send).toHaveBeenCalledWith({ endpoint: '/api/x', params: { a: 1 } });
  });

  it('reports and rethrows transport errors', async () => {
    const onError = vi.fn();
    const api = new CallbackRemoteApi(async () => {
      throw new Error('boom');
    }, onError);
    await expect(api.request({ endpoint: '/x' })).rejects.toThrow('boom');
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('FetchRemoteApi host injection', () => {
  it('uses the injected token, defaults and fetcher (no cookie / localStorage)', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({ Result: 'Success' }),
    })) as unknown as typeof fetch;
    const api = new FetchRemoteApi(undefined, {
      baseUrl: 'https://erp.local',
      getToken: () => 'tok',
      getDefaults: () => ({ PlaceId: { id: 7 }, YearId: { id: 1404 } }),
      fetcher,
    });

    await api.request({ endpoint: '/api/list', params: { q: 1 } });

    const [url, init] = (fetcher as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit];
    expect(url).toBe('https://erp.local/api/list');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer tok',
    );
    expect(JSON.parse(init.body as string)).toMatchObject({
      q: 1,
      Defaults: { PlaceId: 7, YearId: 1404 },
    });
  });
});
