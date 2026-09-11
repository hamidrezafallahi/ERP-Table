import type { RemoteApi } from '../../application/ports/RemoteApi';

/** Default RemoteApi — host injects FetchRemoteApi or a custom adapter. */
export class NoopRemoteApi implements RemoteApi {
  async request<TResponse = unknown>(): Promise<TResponse> {
    return null as TResponse;
  }
}
