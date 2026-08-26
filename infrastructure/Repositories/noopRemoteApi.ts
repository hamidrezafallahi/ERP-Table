import type { RemoteApi } from '../../application/ports/RemoteApi';

/** Default RemoteApi for Node/tests/package builds — host injects a real adapter. */
export class NoopRemoteApi implements RemoteApi {
  async request<TResponse = unknown>(): Promise<TResponse> {
    return null as TResponse;
  }
}
