import { useMemo, useState } from 'react';
import {
  DataGrid,
  jalaliAdapter,
  type ColumnDef,
} from 'persian-data-grid';
import {
  PersianRangeDatePicker,
  PersianRangeDateCell,
  type DateRangeValue,
} from 'persian-data-grid/date-picker-jalali';
import {
  financialPeriodForDate,
  formatPrice,
  numberToPersianWords,
  rialToToman,
} from 'persian-data-grid/finance';
import 'persian-data-grid/styles.css';

type DocLine = {
  id: string;
  item: string;
  date: number;
  amountRial: number;
};

const seed: DocLine[] = [
  {
    id: '1',
    item: 'خدمات مشاوره',
    date: jalaliAdapter.parse('1404/01/15')!.getTime(),
    amountRial: 12_500_000,
  },
  {
    id: '2',
    item: 'اجاره دفتر',
    date: jalaliAdapter.parse('1404/02/01')!.getTime(),
    amountRial: 85_000_000,
  },
  {
    id: '3',
    item: 'حمل و نقل',
    date: jalaliAdapter.parse('1404/02/20')!.getTime(),
    amountRial: 3_200_000,
  },
];

const columns: ColumnDef<DocLine>[] = [
  { field: 'item', headerName: 'شرح', flex: 1 },
  {
    field: 'date',
    headerName: 'تاریخ',
    type: 'date',
    editable: true,
    width: 140,
  },
  {
    field: 'amountRial',
    headerName: 'مبلغ',
    type: 'price',
    currencyUnit: 'toman',
    editable: true,
    width: 160,
  },
];

/**
 * 16 — Document print helpers: Jalali range, FY, Rial/Toman, Persian words.
 */
export default function DocumentFinanceExample() {
  const [rows, setRows] = useState(seed);
  const [range, setRange] = useState<DateRangeValue>({
    start: jalaliAdapter.parse('1404/01/01'),
    end: jalaliAdapter.parse('1404/03/31'),
  });

  const totalRial = useMemo(
    () => rows.reduce((s, r) => s + r.amountRial, 0),
    [rows],
  );
  const period = financialPeriodForDate(new Date());

  return (
    <div style={{ display: 'grid', gap: 12 }} dir="rtl">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'flex-start',
          fontSize: 14,
        }}
      >
        <label style={{ display: 'grid', gap: 4 }}>
          <span>بازه تاریخ سند</span>
          <div style={{ width: 220, position: 'relative' }}>
            <PersianRangeDatePicker
              mode="range"
              range={range}
              onRangeChange={setRange}
            />
          </div>
        </label>
        <div>
          <div>
            <strong>{period.label}</strong>
          </div>
          <div>
            جمع: {formatPrice(totalRial, { displayUnit: 'toman' })} (
            {formatPrice(totalRial, { displayUnit: 'rial' })})
          </div>
          <div style={{ marginTop: 4, maxWidth: 420 }}>
            به حروف: {numberToPersianWords(totalRial, { currency: 'rial' })}
          </div>
          <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
            معادل {rialToToman(totalRial).toLocaleString('fa-IR')} تومان
          </div>
        </div>
      </div>
      <DataGrid<DocLine>
        rowData={rows}
        columnDefs={columns}
        getRowId={(r) => r.id}
        locale="fa"
        direction="rtl"
        dateAdapter={jalaliAdapter}
        components={{ date: PersianRangeDateCell }}
        onCellValueChanged={(e) => {
          if (!e.data) return;
          setRows((prev) =>
            prev.map((r) => (r.id === e.data!.id ? e.data! : r)),
          );
        }}
        tableHeight={280}
      />
    </div>
  );
}
