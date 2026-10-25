import type { RemoteApi } from '../../application/ports/RemoteApi';

/** Shape resolved by RTK Query base queries: they never throw, they resolve `{ error }`. */
export type BaseQueryResult = { data?: unknown; error?: unknown } | null | undefined;

function describeBaseQueryError(error: unknown): string {
  if (error && typeof error === 'object') {
    const { status, data } = error as { status?: unknown; data?: unknown };
    const detail = typeof data === 'string' ? data : data == null ? '' : JSON.stringify(data);
    return `status ${String(status ?? 'unknown')}${detail ? `: ${detail}` : ''}`;
  }
  return String(error);
}

export type RemoteApiRequest = {
  endpoint: string;
  params?: Record<string, unknown>;
  method?: 'GET' | 'POST';
};

/**
 * Wraps ANY host transport as a `RemoteApi` port — the grid never learns how
 * requests are authenticated or where defaults come from.
 *
 * arianERP example (RTK Query base query with token refresh + Redux defaults):
 *
 *   const remoteApi = new CallbackRemoteApi(async ({ endpoint, params, method }) => {
 *     const res = await baseQueryByToken(
 *       { url: endpoint, method: method ?? 'POST', body: params ?? {} },
 *       { getState: () => store.getState(), dispatch: store.dispatch } as never,
 *       {},
 *     );
 *     if (!res || res.error) throw new Error('request failed');  // RTK resolves { error }
 *     return res.data;
 *   });
 *
 * or let `createBaseQueryRemoteApi` do that check (throws on `error`, returns `data`).
 */
export class CallbackRemoteApi implements RemoteApi {
  constructor(
    private readonly send: (request: RemoteApiRequest) => Promise<unknown>,
    private readonly onError?: (error: unknown) => void,
  ) {}

  async request<TResponse = unknown>(input: RemoteApiRequest): Promise<TResponse> {
    try {
      return (await this.send(input)) as TResponse;
    } catch (error) {
      this.onError?.(error);
      throw error;
    }
  }
}

/**
 * Adapter for RTK-style base queries that resolve `{ data } | { error }` instead
 * of throwing. The returned `send` rejects when `error` is set (or the result
 * is empty) and resolves `data` otherwise, so the grid never treats a failure
 * as `undefined` data.
 *
 *   const remoteApi = new CallbackRemoteApi(
 *     createBaseQueryRemoteApi(({ endpoint, params, method }) =>
 *       baseQueryByToken({ url: endpoint, method: method ?? 'POST', body: params ?? {} }, api, {}),
 *     ),
 *   );
 */
export function createBaseQueryRemoteApi(
  run: (request: RemoteApiRequest) => Promise<BaseQueryResult>,
  onError?: (error: unknown, request: RemoteApiRequest) => void,
): (request: RemoteApiRequest) => Promise<unknown> {
  return async (request) => {
    let failure: Error | null = null;
    try {
      const res = await run(request);
      if (!res) {
        failure = new Error(`RemoteApi request failed: empty response ${request.endpoint}`);
      } else if (res.error !== undefined && res.error !== null) {
        failure = new Error(
          `RemoteApi request failed: ${describeBaseQueryError(res.error)} ${request.endpoint}`,
        );
        (failure as Error & { cause?: unknown }).cause = res.error;
      } else {
        return res.data;
      }
    } catch (error) {
      onError?.(error, request);
      throw error;
    }
    onError?.(failure, request);
    throw failure;
  };
}
