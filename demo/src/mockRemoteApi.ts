import type { RemoteApi } from '@fallahi/erp-table';

export type DemoProductResolveResponse = {
  Data: Array<{
    ProductId: string;
    ProductName: string;
    UnitPrice: number;
    HasLot: boolean;
    HasWarehouse: boolean;
    DefaultWarehouse?: string;
  }>;
};

/** Catalog used by the playground mock (mirrors voucher account resolve). */
export const DEMO_PRODUCT_CATALOG: Record<
  string,
  DemoProductResolveResponse['Data'][number]
> = {
  P100: {
    ProductId: 'P100',
    ProductName: 'Widget Alpha',
    UnitPrice: 150,
    HasLot: true,
    HasWarehouse: true,
    DefaultWarehouse: 'WH-NORTH',
  },
  P200: {
    ProductId: 'P200',
    ProductName: 'Gadget Beta',
    UnitPrice: 80,
    HasLot: false,
    HasWarehouse: true,
    DefaultWarehouse: 'WH-SOUTH',
  },
  P300: {
    ProductId: 'P300',
    ProductName: 'Service Gamma',
    UnitPrice: 45,
    HasLot: false,
    HasWarehouse: false,
  },
  P400: {
    ProductId: 'P400',
    ProductName: 'Lot-tracked Part',
    UnitPrice: 220,
    HasLot: true,
    HasWarehouse: false,
  },
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * In-browser mock RemoteApi for demo resolveOn / dynamicSource.
 * Endpoints mirror voucherTemplate AccountId resolve shape (`Data[0].Has*`).
 */
export class DemoMockRemoteApi implements RemoteApi {
  constructor(private readonly latencyMs = 180) {}

  async request<TResponse = unknown>(input: {
    endpoint: string;
    params?: Record<string, unknown>;
    method?: 'GET' | 'POST';
  }): Promise<TResponse> {
    await delay(this.latencyMs);
    const endpoint = input.endpoint.replace(/^\//, '');

    if (
      endpoint === 'api/demo/resolve/product' ||
      endpoint.endsWith('api/demo/resolve/product')
    ) {
      const raw = String(input.params?.Id ?? input.params?.ProductId ?? '');
      const id = raw.trim().toUpperCase();
      const hit = DEMO_PRODUCT_CATALOG[id];
      if (!hit) {
        return { Data: [] } as TResponse;
      }
      return { Data: [{ ...hit }] } as TResponse;
    }

    if (
      endpoint === 'api/demo/select/product' ||
      endpoint.endsWith('api/demo/select/product')
    ) {
      return {
        Data: Object.values(DEMO_PRODUCT_CATALOG).map((p) => ({
          _SelectId: p.ProductId,
          _SelectValue: p.ProductId,
          _SelectDisplay: `${p.ProductId} — ${p.ProductName}`,
          selectValue: p.ProductId,
          selectDisplay: `${p.ProductId} — ${p.ProductName}`,
        })),
        TotalCount: Object.keys(DEMO_PRODUCT_CATALOG).length,
        ReturnCount: Object.keys(DEMO_PRODUCT_CATALOG).length,
      } as TResponse;
    }

    if (
      endpoint === 'api/demo/select/account' ||
      endpoint.endsWith('api/demo/select/account')
    ) {
      const accounts = [
        { id: '1103', label: 'موجودی نزد بانکهای ریالی' },
        { id: '2101', label: 'حسابهای پرداختنی تجاری' },
        { id: '1108', label: 'اسناد دریافتنی' },
      ];
      return {
        Data: accounts.map((a) => ({
          _SelectId: a.id,
          _SelectValue: a.id,
          _SelectDisplay: a.label,
          selectValue: a.id,
          selectDisplay: a.label,
        })),
        TotalCount: accounts.length,
        ReturnCount: accounts.length,
      } as TResponse;
    }

    if (
      endpoint === 'api/demo/select/tafsili' ||
      endpoint.endsWith('api/demo/select/tafsili')
    ) {
      const items = [
        {
          id: 'parsian-sohrevardi',
          label: 'بانک پارسیان-سهروردی - جاری - ۰۰۱۲۳۶۵۴۷۸۹',
        },
        {
          id: 'mellat-valiasr',
          label: 'بانک ملت-ولیعصر - جاری - ۰۰۹۸۷۶۵۴۳۲۱',
        },
      ];
      return {
        Data: items.map((a) => ({
          _SelectId: a.id,
          _SelectValue: a.id,
          _SelectDisplay: a.label,
          selectValue: a.id,
          selectDisplay: a.label,
        })),
        TotalCount: items.length,
        ReturnCount: items.length,
      } as TResponse;
    }

    return { Data: [], TotalCount: 0, ReturnCount: 0 } as TResponse;
  }
}
