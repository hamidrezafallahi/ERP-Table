import { EngineErrorHandler } from '../../engine/EngineErrorHandler';
import { RemoteApi } from '../../application/ports/RemoteApi';

export type ErpDefaults = {
  PlaceId?: { id?: number };
  YearId?: { id?: number };
  LanguageId?: { id?: number };
  CashierId?: { id?: number };
  CurrencyId?: { id?: number };
};

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const cookies = document.cookie.split(';');
  const cookie = cookies.find((item) => item.trim().startsWith(`${name}=`));
  if (!cookie) return '';
  return cookie.trim().slice(name.length + 1);
}

function readErpDefaults(): ErpDefaults {
  if (typeof window === 'undefined') return {};
  try {
    const storage = localStorage.getItem('persist:arianERP');
    const parsedStorage = JSON.parse(storage ?? '{}');
    const parsedConfig = JSON.parse(parsedStorage.config ?? '{}');
    return parsedConfig.defaultConfigs ?? {};
  } catch {
    return {};
  }
}

function joinUrl(baseUrl: string, endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  const base = baseUrl.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

/**
 * Host-injected RemoteApi for arianERP.
 * Not the package default — pass `remoteApi={new FetchRemoteApi()}` from the ERP host.
 * Reads auth cookie `_auth` and redux-persist `persist:arianERP`, then POSTs JSON
 * (relative URLs work on the ERP host).
 * See `examples/host-arian-erp/host-arian-erp.md`.
 */
export type FetchRemoteApiOptions = {
  baseUrl?: string;
  /** Inject the bearer token (e.g. from the host's auth store). Default: cookie `_auth`. */
  getToken?: () => string | undefined | null;
  /** Inject ERP defaults (e.g. from Redux). Default: localStorage `persist:arianERP`. */
  getDefaults?: () => ErpDefaults;
  /** Custom fetch (tests, interceptors, token refresh). Default: global `fetch`. */
  fetcher?: typeof fetch;
};

export class FetchRemoteApi implements RemoteApi {
  constructor(
    private readonly err?: EngineErrorHandler,
    private readonly options: FetchRemoteApiOptions = {},
  ) {}

  async request<TResponse = unknown>(input: {
    endpoint: string;
    params?: Record<string, unknown>;
    method?: 'GET' | 'POST';
  }): Promise<TResponse> {
    try {
      const defaults = this.options.getDefaults?.() ?? readErpDefaults();
      const token = this.options.getToken
        ? (this.options.getToken() ?? '')
        : readCookie('_auth');
      const method = input.method ?? 'POST';
      const url = joinUrl(this.options.baseUrl ?? '', input.endpoint);
      const payload =
        method === 'GET'
          ? undefined
          : {
              ...(input.params ?? {}),
              Defaults: {
                CurrencyId: defaults.CurrencyId?.id,
                CashierId: defaults.CashierId?.id,
                PlaceId: defaults.PlaceId?.id,
                YearId: defaults.YearId?.id,
                LangId: defaults.LanguageId?.id,
              },
            };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await (this.options.fetcher ?? fetch)(url, {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      if (!res.ok) {
        this.err?.handle(`RemoteApi request failed: ${res.status}`, 'FetchRemoteApi.request');
      }
      return (await res.json()) as TResponse;
    } catch (error) {
      this.err?.handle(error, 'FetchRemoteApi.request');
      throw error;
    }
  }
}
