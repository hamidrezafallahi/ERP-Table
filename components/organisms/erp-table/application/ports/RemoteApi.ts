//application/ports

export interface RemoteApi {
  request<TResponse = any>(input: {
    endpoint: string;
    params?: Record<string, any>;
    method?: 'GET' | 'POST';
  }): Promise<TResponse>;
}
