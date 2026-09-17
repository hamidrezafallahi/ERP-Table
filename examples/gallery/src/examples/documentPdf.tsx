import { useMemo, useState } from 'react';
import {
  DataGrid,
  type ColumnDef,
} from 'persian-data-grid';
import {
  VazirmatnPdfRenderer,
  type DocumentPdfTemplate,
} from 'persian-data-grid/plugins/pdf';
import { vazirmatnRegularBytes } from 'persian-data-grid/plugins/pdf/fonts/vazirmatn';
import 'persian-data-grid/styles.css';

type DocLine = {
  id: string;
  item: string;
  qty: number;
  price: number;
};

const seed: DocLine[] = Array.from({ length: 28 }, (_, i) => ({
  id: String(i + 1),
  item: `قلم ${i + 1}`,
  qty: (i % 5) + 1,
  price: 100_000 * (i + 1),
}));

const columns: ColumnDef<DocLine>[] = [
  { field: 'item', headerName: 'شرح', flex: 1 },
  { field: 'qty', headerName: 'تعداد', type: 'number', width: 90 },
  { field: 'price', headerName: 'مبلغ', type: 'price', width: 140 },
];

/**
 * 17 — Document PDF template (PR-141): header/footer/logo/page#/sign/stamp/totals.
 */
export default function DocumentPdfExample() {
  const [rows] = useState(seed);
  const [status, setStatus] = useState('Ready');
  const renderer = useMemo(
    () => new VazirmatnPdfRenderer(vazirmatnRegularBytes()),
    [],
  );

  const template: DocumentPdfTemplate = {
    header: {
      title: 'فاکتور فروش',
      subtitle: 'persian-data-grid',
      meta: ['شماره: DEMO-141', 'تاریخ: ۱۴۰۴/۰۶/۲۰'],
    },
    footer: { text: 'نمونه سند', showPageNumber: true },
    signature: { label: 'امضا', lines: 2 },
    stamp: { label: 'مهر' },
    pageTotals: { columns: ['price'], label: 'جمع صفحه' },
    repeatTableHeader: true,
  };

  return (
    <div style={{ display: 'grid', gap: 12 }} dir="rtl">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={async () => {
            setStatus('Rendering…');
            const source = {
              columns: [
                { fieldName: 'item', fieldCaption: 'شرح', fieldType: 'text' },
                { fieldName: 'qty', fieldCaption: 'تعداد', fieldType: 'number' },
                { fieldName: 'price', fieldCaption: 'مبلغ', fieldType: 'price' },
              ],
              rows: rows.map((r, i) => ({
                id: i + 1,
                rowState: 'Active',
                cells: {
                  item: { value: r.item },
                  qty: { value: r.qty },
                  price: { value: r.price },
                },
              })),
            };
            const blob = await renderer.render(source, {
              direction: 'rtl',
              template,
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document-template.pdf';
            a.click();
            URL.revokeObjectURL(url);
            setStatus(`PDF ${Math.round(blob.size / 1024)} KB downloaded`);
          }}
        >
          Download document PDF
        </button>
        <span style={{ opacity: 0.7, fontSize: 13 }}>{status}</span>
      </div>
      <DataGrid<DocLine>
        rowData={rows}
        columnDefs={columns}
        getRowId={(r) => r.id}
        locale="fa"
        direction="rtl"
        tableHeight={320}
      />
    </div>
  );
}
