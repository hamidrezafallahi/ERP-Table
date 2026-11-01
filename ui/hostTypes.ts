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

/**
 * Envelope returned by arianERP query endpoints. Structural twin of the host's
 * `IBaseQueryResponse<T>`: it is the response type handed to
 * `ColumnSchema.resolveOn.getResponse` / `mapFlags`.
 */
export interface IBaseQueryResponse<T = unknown> {
  Result: string;
  Error?: string;
  ErrorCode?: string;
  InnerException?: string;
  AdditionalInfo?: unknown;
  Data: T;
  TotalCount: number;
  ReturnCount: number;
  ReadFromCache: boolean;
  ExportFile?: string;
  ExportString?: string;
  YearPlanId?: number;
  Url?: string;
}

/**
 * Deliberately loose payload type for ERP query envelopes: arianERP endpoints
 * return untyped JSON and host configs index it freely (`res.Data[0].HasX`).
 * This is the single, documented `any` escape hatch of the host-facing types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ERPLooseData = any;

/**
 * `RemoteApi` as seen by host `computed` callbacks: `request()` resolves to the
 * ERP envelope by default.
 */
export interface HostRemoteApi {
  request<TResponse = IBaseQueryResponse<ERPLooseData>>(input: {
    endpoint: string;
    params?: Record<string, unknown>;
    method?: 'GET' | 'POST';
  }): Promise<TResponse>;
}
