import { createElement } from 'react';

import type {
  CellRenderContext,
  ColumnSchema,
  RowInput,
} from 'persian-data-grid';

/** Always-on index column — same shape as voucherTemplate/config.ts */
export const DEMO_INDEX_COLUMN: ColumnSchema = {
  fieldName: 'index',
  fieldCaption: 'Row · Actions',
  fieldType: 'index',
  order: 1,
  enableDeleteButton: true,
  enableExpandButton: false,
  enableMoveButton: true,
  enableOptionsButton: true,
  visibility: { kind: 'always' },
  indexOptions: (tableKey, rowId, row, controller) => {
    void tableKey;
    const allRows = controller.getAllRows() ?? [];
    const activeCol = controller.getViewState()?.activeCell?.columnId as
      | string
      | undefined;
    const cellVal = (
      r: { cells?: Record<string, { value?: unknown } | unknown> },
      key: string,
    ) => {
      const c = r.cells?.[key];
      if (c && typeof c === 'object' && c !== null && 'value' in c) {
        return (c as { value: unknown }).value;
      }
      return c;
    };
    const rowQty = Number(cellVal(row, 'qty') ?? 0);
    const rowPrice = Number(cellVal(row, 'price') ?? 0);

    const duplicateFromUpperRow = () => {
      const rowIndex = allRows.findIndex(
        (r: { id: { value: number } }) => r.id.value === rowId,
      );
      if (rowIndex > 0 && activeCol) {
        const previous = allRows[rowIndex - 1].getCell(activeCol)?.getValue();
        if (previous != null && previous !== '') {
          void controller.dispatch({
            type: 'UI_CELL_CHANGE',
            value: previous,
            rowId,
            columnId: activeCol,
          });
        }
      }
    };

    return [
      {
        key: '10',
        label: 'Copy from row above',
        disabled:
          allRows.findIndex((r: { id: { value: number } }) => r.id.value === rowId) <= 0,
        onClick: () => duplicateFromUpperRow(),
      },
      {
        key: '11',
        label: 'Clear price',
        disabled: rowPrice === 0,
        onClick: () => {
          void controller.dispatch({
            type: 'UI_CELL_CHANGE',
            value: 0,
            rowId,
            columnId: 'price',
          });
        },
      },
      {
        key: '12',
        label: 'Double qty',
        onClick: () => {
          void controller.dispatch({
            type: 'UI_CELL_CHANGE',
            value: rowQty * 2,
            rowId,
            columnId: 'qty',
          });
        },
      },
      {
        key: '13',
        label: 'Swap qty & price',
        onClick: () => {
          void controller.dispatch({
            type: 'UI_CELL_CHANGE',
            value: rowPrice,
            rowId,
            columnId: 'qty',
          });
          void controller.dispatch({
            type: 'UI_CELL_CHANGE',
            value: rowQty,
            rowId,
            columnId: 'price',
          });
        },
      },
    ];
  },
};

/** Data columns only — index is injected by ensureDemoColumns. */
export const DEMO_DATA_COLUMNS: ColumnSchema[] = [
  {
    fieldName: 'item',
    fieldCaption: 'Item',
    fieldType: 'text',
    fieldCollection: 'default',
    order: 2,
    visibility: { kind: 'always' },
  },
  /**
   * Trigger column (like voucher AccountId): changing it calls resolveOn → mock API,
   * fills productName / price, and toggles whenRemoteFlag columns (lot / warehouse).
   */
  {
    fieldName: 'productId',
    fieldCaption: 'Product',
    fieldType: 'selectOption',
    fieldCollection: 'default',
    order: 3,
    visibility: { kind: 'always' },
    selectOptions: [
      { label: 'P100 — Widget Alpha', value: 'P100' },
      { label: 'P200 — Gadget Beta', value: 'P200' },
      { label: 'P300 — Service Gamma', value: 'P300' },
      { label: 'P400 — Lot-tracked Part', value: 'P400' },
    ],
    dynamicSource: {
      endpoint: 'api/demo/select/product',
    },
    resolveOn: {
      fieldName: 'productId',
      endpoint: 'api/demo/resolve/product',
      buildParams: (row) => ({
        Id: String(row.productId ?? ''),
      }),
      getResponse: (res, row) => {
        const data = (res as { Data?: Array<Record<string, unknown>> })?.Data?.[0];
        if (!data) {
          row.getCell('productName')?.changeValue('');
          row.getCell('productName')?.changeDisplay('');
          return;
        }
        const name = String(data.ProductName ?? '');
        const unitPrice = Number(data.UnitPrice ?? 0);
        const qty = Number(row.getCell('qty')?.getValue() ?? 0);
        row.getCell('productName')?.changeValue(name);
        row.getCell('productName')?.changeDisplay(name);
        // Replace price from catalog (same row, other column).
        row.getCell('price')?.changeValue(unitPrice);
        row.getCell('price')?.changeDisplay(unitPrice);
        row.getCell('totalPrice')?.changeValue(qty * unitPrice);
        row.getCell('totalPrice')?.changeDisplay(qty * unitPrice);
        if (data.DefaultWarehouse) {
          row.getCell('warehouseId')?.changeValue(data.DefaultWarehouse);
          row.getCell('warehouseId')?.changeDisplay(data.DefaultWarehouse);
        } else {
          row.getCell('warehouseId')?.changeValue('');
          row.getCell('warehouseId')?.changeDisplay('');
        }
      },
      mapFlags: (res) => {
        const data = (res as { Data?: Array<Record<string, unknown>> })?.Data?.[0];
        if (!data) {
          return {
            lotNumber: false,
            warehouseId: false,
          };
        }
        return {
          lotNumber: Boolean(data.HasLot),
          warehouseId: Boolean(data.HasWarehouse),
        };
      },
    },
  },
  {
    fieldName: 'productName',
    fieldCaption: 'Product name',
    fieldType: 'text',
    fieldCollection: 'default',
    order: 4,
    editable: false,
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'qty',
    fieldCaption: 'Qty',
    fieldType: 'number',
    fieldCollection: 'default',
    order: 5,
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'price',
    fieldCaption: 'Price',
    fieldType: 'price',
    fieldCollection: 'default',
    order: 6,
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'totalPrice',
    fieldCaption: 'Total',
    fieldType: 'static',
    order: 7,
    computed: {
      dependsOn: ['qty', 'price'],
      compute: async (row) => {
        const qty = Number(row.qty ?? 0);
        const price = Number(row.price ?? 0);
        return qty * price;
      },
    },
    fieldCollection: 'default',
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'lotNumber',
    fieldCaption: 'Lot #',
    fieldType: 'text',
    fieldCollection: 'default',
    order: 8,
    visibility: {
      kind: 'whenRemoteFlag',
      sourceFieldName: 'productId',
      flag: 'lotNumber',
    },
  },
  {
    fieldName: 'warehouseId',
    fieldCaption: 'Warehouse',
    fieldType: 'text',
    fieldCollection: 'default',
    order: 9,
    visibility: {
      kind: 'whenRemoteFlag',
      sourceFieldName: 'productId',
      flag: 'warehouseId',
    },
  },
  {
    fieldName: 'date',
    fieldCaption: 'Date',
    fieldType: 'date',
    fieldCollection: 'default',
    order: 10,
    visibility: { kind: 'always' },
  },
];

/** Index column is always first (lowest order), regardless of caller config. */
export function ensureDemoColumns(columns: ColumnSchema[] = DEMO_DATA_COLUMNS): ColumnSchema[] {
  const withoutIndex = columns.filter(
    (c) => c.fieldType !== 'index' && c.fieldName !== 'index',
  );
  const data = withoutIndex.map((col, i) => ({
    ...col,
    // Engine sorts by (order ?? 0); index must stay first → order starts at 2
    order: col.order != null && col.order > 1 ? col.order : i + 2,
  }));
  return [{ ...DEMO_INDEX_COLUMN, order: 1 }, ...data].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
}

export const DEMO_COLUMNS = ensureDemoColumns(DEMO_DATA_COLUMNS);

/** Screenshot / voucherTemplate chrome — اقلام سند */
export const VOUCHER_INDEX_COLUMN: ColumnSchema = {
  fieldName: 'index',
  fieldCaption: 'ردیف - عملیات',
  fieldType: 'index',
  order: 1,
  enableDeleteButton: true,
  enableExpandButton: false,
  enableMoveButton: true,
  enableOptionsButton: true,
  visibility: { kind: 'always' },
  indexOptions: (_tableKey, rowId, row, controller) => {
    const allRows = controller.getAllRows() ?? [];
    const cellVal = (
      r: { cells?: Record<string, { value?: unknown } | unknown> },
      key: string,
    ) => {
      const c = r.cells?.[key];
      if (c && typeof c === 'object' && c !== null && 'value' in c) {
        return (c as { value: unknown }).value;
      }
      return c;
    };
    const sumBed = allRows.reduce(
      (acc, curr) => acc + (Number(curr.getCell('Bed')?.getValue()) || 0),
      0,
    );
    const sumBes = allRows.reduce(
      (acc, curr) => acc + (Number(curr.getCell('Bes')?.getValue()) || 0),
      0,
    );
    const rowBed = Number(cellVal(row, 'Bed') ?? 0);
    const rowBes = Number(cellVal(row, 'Bes') ?? 0);
    return [
      {
        key: '10',
        label: 'تراز کردن مانده',
        disabled: sumBed === sumBes,
        onClick: () => {
          const diff = Math.abs(sumBed - sumBes);
          if (sumBed === sumBes) return;
          if (sumBed > sumBes) {
            void controller.dispatch({
              type: 'UI_CELL_CHANGE',
              value: rowBes + diff,
              rowId,
              columnId: 'Bes',
            });
          } else {
            void controller.dispatch({
              type: 'UI_CELL_CHANGE',
              value: rowBed + diff,
              rowId,
              columnId: 'Bed',
            });
          }
        },
      },
      {
        key: '11',
        label: 'کپی از سطر بالا',
        disabled:
          allRows.findIndex((r: { id: { value: number } }) => r.id.value === rowId) <= 0,
        onClick: () => {
          const rowIndex = allRows.findIndex(
            (r: { id: { value: number } }) => r.id.value === rowId,
          );
          const activeCol = controller.getViewState()?.activeCell?.columnId as
            | string
            | undefined;
          if (rowIndex > 0 && activeCol) {
            const previous = allRows[rowIndex - 1].getCell(activeCol)?.getValue();
            if (previous != null && previous !== '') {
              void controller.dispatch({
                type: 'UI_CELL_CHANGE',
                value: previous,
                rowId,
                columnId: activeCol,
              });
            }
          }
        },
      },
      {
        key: '12',
        label: 'جابه‌جایی بدهکار و بستانکار',
        onClick: () => {
          void controller.dispatch({
            type: 'UI_CELL_CHANGE',
            value: rowBes,
            rowId,
            columnId: 'Bed',
          });
          void controller.dispatch({
            type: 'UI_CELL_CHANGE',
            value: rowBed,
            rowId,
            columnId: 'Bes',
          });
        },
      },
    ];
  },
};

export const VOUCHER_DATA_COLUMNS: ColumnSchema[] = [
  {
    fieldName: 'AccountId',
    fieldCaption: 'سرفصل حساب',
    fieldType: 'selectOption',
    fieldCollection: 'default',
    order: 2,
    minWidth: 180,
    visibility: { kind: 'always' },
    selectOptions: [
      { label: 'موجودی نزد بانکهای ریالی', value: '1103' },
      { label: 'حسابهای پرداختنی تجاری', value: '2101' },
      { label: 'اسناد دریافتنی', value: '1108' },
    ],
    dynamicSource: { endpoint: 'api/demo/select/account' },
    returnDisplayValue: (values) => {
      const map: Record<string, string> = {
        '1103': 'موجودی نزد بانکهای ریالی',
        '2101': 'حسابهای پرداختنی تجاری',
        '1108': 'اسناد دریافتنی',
      };
      const id = String(values['AccountId'] ?? '');
      return map[id] ?? id;
    },
  },
  {
    fieldName: 'TafsiliId',
    fieldCaption: 'تفصیلی',
    fieldType: 'selectOption',
    fieldCollection: 'default',
    order: 3,
    minWidth: 280,
    visibility: { kind: 'always' },
    selectOptions: [
      {
        label: 'بانک پارسیان-سهروردی - جاری - ۰۰۱۲۳۶۵۴۷۸۹',
        value: 'parsian-sohrevardi',
      },
      {
        label: 'بانک ملت-ولیعصر - جاری - ۰۰۹۸۷۶۵۴۳۲۱',
        value: 'mellat-valiasr',
      },
    ],
    dynamicSource: { endpoint: 'api/demo/select/tafsili' },
    returnDisplayValue: (values) => {
      const map: Record<string, string> = {
        'parsian-sohrevardi':
          'بانک پارسیان-سهروردی - جاری - ۰۰۱۲۳۶۵۴۷۸۹',
        'mellat-valiasr': 'بانک ملت-ولیعصر - جاری - ۰۰۹۸۷۶۵۴۳۲۱',
      };
      const id = String(values['TafsiliId'] ?? '');
      return map[id] ?? id;
    },
  },
  {
    fieldName: 'DetailDesc',
    fieldCaption: 'شرح ردیف',
    fieldType: 'textArea',
    fieldCollection: 'default',
    order: 4,
    minWidth: 140,
    className: 'text-start',
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'Bed',
    fieldCaption: 'بدهکار',
    fieldType: 'price',
    fieldCollection: 'default',
    order: 5,
    minWidth: 120,
    className: 'text-center justify-center',
    visibility: { kind: 'always' },
    onChange: (_tableKey, rowId, _row, controller) => {
      void controller.dispatch({
        type: 'UI_CELL_CHANGE',
        value: 0,
        rowId,
        columnId: 'Bes',
      });
    },
  },
  {
    fieldName: 'Bes',
    fieldCaption: 'بستانکار',
    fieldType: 'price',
    fieldCollection: 'default',
    order: 6,
    minWidth: 120,
    className: 'text-center justify-center',
    visibility: { kind: 'always' },
    onChange: (_tableKey, rowId, _row, controller) => {
      void controller.dispatch({
        type: 'UI_CELL_CHANGE',
        value: 0,
        rowId,
        columnId: 'Bed',
      });
    },
  },
  {
    fieldName: 'FollowUpNumber',
    fieldCaption: 'شماره پیگیری',
    fieldType: 'text',
    fieldCollection: 'default',
    order: 7,
    minWidth: 110,
    className: 'text-center justify-center',
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'FollowUpDate',
    fieldCaption: 'تاریخ پیگیری',
    fieldType: 'date',
    fieldCollection: 'default',
    order: 8,
    minWidth: 120,
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'SideMark',
    fieldCaption: 'طرف',
    fieldType: 'static',
    editable: false,
    fieldCollection: 'default',
    order: 9,
    minWidth: 56,
    className: 'text-center justify-center',
    visibility: { kind: 'always' },
    render: (raw) => {
      const ctx = raw as CellRenderContext;
      const bed = Number(
        ctx.controller.getCell(ctx.row.id, 'Bed')?.getValue() ?? 0,
      );
      const bes = Number(
        ctx.controller.getCell(ctx.row.id, 'Bes')?.getValue() ?? 0,
      );
      const label = bed > 0 ? 'بد' : bes > 0 ? 'بس' : '—';
      return createElement(
        'span',
        { 'data-erp-custom-cell': 'SideMark' },
        label,
      );
    },
  },
  {
    fieldName: 'Confirmed',
    fieldCaption: 'تأیید',
    fieldType: 'checkbox',
    fieldCollection: 'default',
    order: 10,
    minWidth: 56,
    className: 'text-center justify-center',
    visibility: { kind: 'always' },
  },
];

export const VOUCHER_COLUMNS: ColumnSchema[] = [
  { ...VOUCHER_INDEX_COLUMN, order: 1 },
  ...VOUCHER_DATA_COLUMNS,
];

/** ۱۴۰۵/۰۶/۱۸ */
export const VOUCHER_FOLLOW_UP_DATE = new Date(
  '2026-09-09T12:00:00+03:30',
).valueOf();

export function buildVoucherDemoRows(count = 2): RowInput[] {
  const debit: RowInput['values'] = {
    AccountId: '1103',
    TafsiliId: 'parsian-sohrevardi',
    DetailDesc: '123',
    Bed: 10000000,
    Bes: '',
    FollowUpNumber: '123124',
    FollowUpDate: VOUCHER_FOLLOW_UP_DATE,
  };
  const credit: RowInput['values'] = {
    AccountId: '1103',
    TafsiliId: 'parsian-sohrevardi',
    DetailDesc: '3321',
    Bed: '',
    Bes: 10000000,
    FollowUpNumber: '123124',
    FollowUpDate: VOUCHER_FOLLOW_UP_DATE,
  };

  const size = Math.max(1, count);
  return Array.from({ length: size }, (_, i) => {
    const isDebit = i % 2 === 0;
    const base = isDebit ? debit : credit;
    return {
      id: i + 1,
      collection: 'default',
      values: {
        ...base,
        DetailDesc: String(Number(base.DetailDesc ?? 100) + i),
        FollowUpNumber: String(123124 + i),
        Bed: isDebit ? 10_000_000 + i * 1_000 : '',
        Bes: isDebit ? '' : 10_000_000 + i * 1_000,
        Confirmed: isDebit,
      },
    };
  });
}

export function buildDemoRows(count = 200): RowInput[] {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const qty = (id % 12) + 1;
    const price = ((id * 17) % 900) + 50;
    return {
      id,
      collection: 'default',
      values: {
        item: `SKU-${String(id).padStart(4, '0')}`,
        productId: '',
        productName: '',
        qty,
        price,
        totalPrice: qty * price,
        lotNumber: '',
        warehouseId: '',
        date: '2026-01-01',
      },
    };
  });
}
