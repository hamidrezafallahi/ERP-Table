import type { RemoteApi } from '../../application/ports/RemoteApi';

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
 *     return res.data;
 *   });
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
