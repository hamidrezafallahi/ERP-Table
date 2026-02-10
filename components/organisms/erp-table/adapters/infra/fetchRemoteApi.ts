//adapters/infra
import { baseQueryByToken } from '@services/customBaseQuery';

import { RemoteApi } from '../../application/ports/RemoteApi';

export class FetchRemoteApi implements RemoteApi {
  async request<TResponse = any>(input: {
    endpoint: string;
    params?: Record<string, any>;
    method?: 'GET' | 'POST';
  }): Promise<TResponse> {
    let storage: string | null = null;
    if (typeof window !== 'undefined') {
      storage = localStorage.getItem('persist:root');
    }
    const parsedStorage = JSON.parse(storage);
    const parsedConfig = JSON.parse(parsedStorage.config);
    const args = {
      url: input.endpoint,
      method: input.method ?? 'POST',
      body: input.params ?? {},
    };
    const api = {
      getState:()=> {return {withPersist: { config: { defaultConfigs: parsedConfig.defaultConfigs } }} },
      dispatch: () => { }, 
    } as any;
    const res = await baseQueryByToken(args, api, {});
    // if (!res.data.Result !== "Success") throw new Error(`RemoteApi POST failed: ${res.status} ${res.statusText}`);
    if (!res) throw new Error(`RemoteApi POST failed: ${res.status} ${res.statusText}`);
    return (res.data) as TResponse;
  }
}
