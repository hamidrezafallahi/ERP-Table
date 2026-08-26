/**
 * Host-agnostic request config shape used by UI multi-select bindings.
 * Host apps may narrow this to their own IRequestConfig.
 */
export type IRequestConfig = {
  endpoint?: string;
  params?: Record<string, unknown>;
  method?: 'GET' | 'POST';
  [key: string]: unknown;
};
