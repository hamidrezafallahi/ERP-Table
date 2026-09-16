//application/ports

export interface RemoteApi {
  request<TResponse = unknown>(input: {
    endpoint: string;
    params?: Record<string, unknown>;
    method?: 'GET' | 'POST';
  }): Promise<TResponse>;
}
