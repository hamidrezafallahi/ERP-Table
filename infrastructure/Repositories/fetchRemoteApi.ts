// adapters/infra

import { baseQueryByToken } from '@services/customBaseQuery';

import { RemoteApi } from '../../application/ports/RemoteApi';
import { EngineErrorHandler } from '../../engine/EngineErrorHandler';

export class FetchRemoteApi implements RemoteApi {
  constructor(
    private readonly err?: EngineErrorHandler,
  ) { }
  async request<TResponse = any>(input: {
    endpoint: string;
    params?: Record<string, any>;
    method?: 'GET' | 'POST';
  }): Promise<TResponse> {
    try {
      let storage: string | null = null;
      if (typeof window !== 'undefined') {
        storage = localStorage.getItem('persist:arianERP');
      }
      const parsedStorage = JSON.parse(storage ?? '{}');
      // fix TS: null قابل JSON.parse نیست
      const parsedConfig = JSON.parse(
        parsedStorage.config ?? '{}'
      );
      // fix TS: config ممکن است undefined باشد
      const args = {
        url: input.endpoint,
        method: input.method ?? 'POST',
        body: input.params ?? {},
      };
      const api = {
        getState: () => {
          return {
            withPersist: {
              config: {
                defaultConfigs: parsedConfig.defaultConfigs
              }
            }
          };
        },
        dispatch: () => { },
      } as any;
      const res = await baseQueryByToken(args, api, {});
      if (!res) {
        this.err.handle(
          'RemoteApi request failed: empty response'
        );
        throw new Error(
          'RemoteApi request failed: empty response'
        );
      }
      return res.data as TResponse;
    } catch (error) {
      this.err.handle(
        error,
        'FetchRemoteApi.request'
      );
      throw error;
    }
  }
}