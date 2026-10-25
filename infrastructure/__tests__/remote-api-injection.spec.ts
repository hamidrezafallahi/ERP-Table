import { describe, expect, it, vi } from 'vitest';

import {
  CallbackRemoteApi,
  createBaseQueryRemoteApi,
} from '../Repositories/callbackRemoteApi';
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

describe('FetchRemoteApi failure handling', () => {
  const make = (res: unknown, handle = vi.fn()) => {
    const fetcher = vi.fn(async () => {
      if (res instanceof Error) throw res;
      return res;
    }) as unknown as typeof fetch;
    const err = { handle } as never;
    return {
      handle,
      api: new FetchRemoteApi(err, {
        baseUrl: 'https://erp.local',
        getToken: () => 't',
        getDefaults: () => ({}),
        fetcher,
      }),
    };
  };

  it('200 OK returns the parsed JSON and reports nothing', async () => {
    const { api, handle } = make({ ok: true, status: 200, json: async () => ({ Data: [1] }) });
    await expect(api.request({ endpoint: '/api/x' })).resolves.toEqual({ Data: [1] });
    expect(handle).not.toHaveBeenCalled();
  });

  it('500 with a JSON body rejects (status + endpoint) instead of returning the body', async () => {
    const { api, handle } = make({ ok: false, status: 500, json: async () => ({ Result: 'Failed' }) });
    await expect(api.request({ endpoint: '/api/x' })).rejects.toThrow(/500.*\/api\/x/);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('502 with an HTML body rejects with a clear error, not a SyntaxError', async () => {
    const { api, handle } = make({ ok: false, status: 502, json: async () => ({}) });
    const error = await api.request({ endpoint: '/api/y' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(SyntaxError);
    expect((error as Error).message).toMatch(/502.*\/api\/y/);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('200 with a non-JSON body rejects with a clear error', async () => {
    const { api } = make({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    });
    const error = await api.request({ endpoint: '/api/z' }).catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(SyntaxError);
    expect((error as Error).message).toMatch(/not valid JSON.*200.*\/api\/z/);
  });

  it('network errors are reported once and rethrown', async () => {
    const { api, handle } = make(new TypeError('Failed to fetch'));
    await expect(api.request({ endpoint: '/api/x' })).rejects.toThrow('Failed to fetch');
    expect(handle).toHaveBeenCalledTimes(1);
  });
});

describe('createBaseQueryRemoteApi', () => {
  it('returns data when the base query resolves { data }', async () => {
    const send = createBaseQueryRemoteApi(async () => ({ data: { Result: 'Success' } }));
    await expect(send({ endpoint: '/a' })).resolves.toEqual({ Result: 'Success' });
  });

  it('throws when the base query resolves { error } and reports it', async () => {
    const onError = vi.fn();
    const send = createBaseQueryRemoteApi(
      async () => ({ error: { status: 400, data: 'PlaceId or YearId is missing' } }),
      onError,
    );
    await expect(send({ endpoint: '/a' })).rejects.toThrow(
      /400.*PlaceId or YearId is missing.*\/a/,
    );
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('throws on an empty result (host toast-only 403 path)', async () => {
    const send = createBaseQueryRemoteApi(async () => undefined);
    await expect(send({ endpoint: '/a' })).rejects.toThrow(/empty response/);
  });

  it('composes with CallbackRemoteApi so failures reject instead of resolving undefined', async () => {
    const api = new CallbackRemoteApi(
      createBaseQueryRemoteApi(async () => ({ error: { status: 'FETCH_ERROR' } })),
    );
    await expect(api.request({ endpoint: '/a' })).rejects.toThrow(/FETCH_ERROR/);
  });
});
