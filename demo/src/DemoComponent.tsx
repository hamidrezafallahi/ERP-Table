import { useCallback, useEffect, useState } from 'react';

import {
  createERPTable,
  ExcelExportPlugin,
  PdfExportPlugin,
  VirtualList,
  type CreateERPTableResult,
} from '@fallahi/erp-table';

import { buildDemoRows, DEMO_COLUMNS } from './fixtures';
import styles from './site.module.css';

type SnapRow = NonNullable<
  ReturnType<CreateERPTableResult['session']['getSnapShot']>
>['rows'][number];

type LogItem = { at: string; message: string };

export default function DemoComponent() {
  const [grid, setGrid] = useState<CreateERPTableResult | null>(null);
  const [rows, setRows] = useState<SnapRow[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(200);
  const [, bump] = useState(0);

  const pushLog = useCallback((message: string) => {
    const at = new Date().toLocaleTimeString('fa-IR', { hour12: false });
    setLogs((prev) => [{ at, message }, ...prev].slice(0, 40));
  }, []);

  const refresh = useCallback((result: CreateERPTableResult) => {
    setRows(result.session.getSnapShot('active')?.rows ?? []);
    setHistory(
      result.session.getHistoryItems().slice(0, 12).map((h) => `${h.type}: ${h.title}`),
    );
    bump((n) => n + 1);
  }, []);

  const boot = useCallback(
    async (count: number) => {
      setError(null);
      try {
        const result = await createERPTable({
          store: 'demo-store',
          tableKey: 'demo-lines',
          actor: { userId: 'demo', roles: ['admin'] },
          tableType: 'default',
          activeCollection: 'default',
          columns: DEMO_COLUMNS,
          rows: buildDemoRows(count),
          plugins: [
            new ExcelExportPlugin({ download: true }),
            new PdfExportPlugin({ download: true }),
          ],
        });
        setGrid(result);
        refresh(result);
        pushLog(`booted createERPTable with ${count} rows`);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [pushLog, refresh],
  );

  useEffect(() => {
    void boot(rowCount);
  }, [boot, rowCount]);

  useEffect(() => {
    if (!grid) return;
    return grid.session.subscribe(() => refresh(grid));
  }, [grid, refresh]);

  const onCellChange = async (rowId: number, columnId: string, value: string) => {
    if (!grid) return;
    const parsed = columnId === 'item' ? value : Number(value);
    await grid.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: grid.session.store,
      tableKey: grid.session.tableKey,
      rowId,
      columnId,
      newValue: parsed,
    });
    pushLog(`CHANGE_CELL_VALUE row=${rowId} ${columnId}=${JSON.stringify(parsed)}`);
  };

  return (
    <div className={`${styles.page} ${styles.pageFa}`} dir="rtl">
      <div className={`${styles.shell} ${styles.demoStack}`}>
        <header className={styles.topbar}>
          <div className={styles.brandMark}>
            <span className={styles.logo} aria-hidden />
            <span className={styles.brandText}>
              <span className={styles.brandName}>ERP Table Playground</span>
              <span className={styles.brandSub}>Manual QA · createERPTable + VirtualList</span>
            </span>
          </div>
        </header>

        <section className={styles.demoCard}>
          <span className={styles.demoBadge}>
            <span className={styles.liveDot} aria-hidden />
            DEV · VITE_APP_MODE=dev
          </span>
          <h1 className={styles.demoCardTitle} style={{ fontSize: '1.45rem' }}>
            Interactive QA Playground
          </h1>
          <p className={styles.demoCardLead}>
            سطح منتشرشده کتابخانه: session، undo، history، VirtualList و export plugins. UI میزبان
            (ERPTable) اینجا نیست.
          </p>

          <div className={styles.demoToolbar}>
            <span className={styles.demoCardLead} style={{ margin: 0 }}>
              ردیف‌ها:
            </span>
            {[50, 200, 2000].map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.demoToggle} ${rowCount === n ? styles.demoToggleActive : ''}`}
                onClick={() => setRowCount(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <div className={styles.demoToolbar}>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!grid?.session.canUndo()}
              onClick={async () => {
                if (!grid) return;
                const ok = await grid.session.undo();
                pushLog(`undo → ${ok}`);
              }}
            >
              Undo
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              onClick={async () => {
                if (!grid) return;
                await grid.session.dispatchViewIntent({
                  type: 'ADD_EMPTY_ROW',
                  autoActivate: false,
                });
                pushLog('ADD_EMPTY_ROW');
              }}
            >
              Add row
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              onClick={async () => {
                if (!grid) return;
                await grid.pluginHost.requestExport({ format: 'xlsx' });
                pushLog('requestExport xlsx');
              }}
            >
              Export XLSX
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              onClick={async () => {
                if (!grid) return;
                await grid.pluginHost.requestExport({ format: 'pdf' });
                pushLog('requestExport pdf');
              }}
            >
              Export PDF
            </button>
          </div>

          {error && (
            <p className={styles.demoCardLead} style={{ color: '#b42318' }}>
              {error}
            </p>
          )}
        </section>

        <section className={styles.demoCard}>
          <div className={`${styles.demoToolbar} ${styles.demoToolbarBetween}`}>
            <h2 className={styles.demoCardTitle} style={{ margin: 0 }}>
              VirtualList
            </h2>
            <span className={styles.demoCardLead} style={{ margin: 0 }}>
              {rows.length} rows
            </span>
          </div>
          {grid ? (
            <div className={styles.gridShell}>
              <div className={styles.gridHeader}>
                <span>ID</span>
                <span>Item</span>
                <span>Qty</span>
                <span>Amount</span>
              </div>
              <VirtualList
                session={grid.session}
                items={rows}
                height={360}
                rowHeight={40}
                overscan={4}
                getItemKey={(row) => row.id}
                renderItem={(row) => (
                  <div className={styles.gridRow}>
                    <span>{row.id}</span>
                    <input
                      defaultValue={String(row.cells.item ?? '')}
                      onBlur={(e) => void onCellChange(row.id, 'item', e.target.value)}
                    />
                    <input
                      defaultValue={String(row.cells.qty ?? '')}
                      onBlur={(e) => void onCellChange(row.id, 'qty', e.target.value)}
                    />
                    <input
                      defaultValue={String(row.cells.amount ?? '')}
                      onBlur={(e) => void onCellChange(row.id, 'amount', e.target.value)}
                    />
                  </div>
                )}
              />
            </div>
          ) : (
            <p className={styles.demoCardLead}>در حال راه‌اندازی…</p>
          )}
        </section>

        <section className={styles.demoCard}>
          <h2 className={styles.demoCardTitle}>History (session)</h2>
          <pre className={styles.demoLog}>
            {history.length === 0 ? '// هنوز رویدادی نیست' : history.join('\n')}
          </pre>
        </section>

        <section className={styles.demoCard}>
          <div className={`${styles.demoToolbar} ${styles.demoToolbarBetween}`}>
            <h2 className={styles.demoCardTitle} style={{ margin: 0 }}>
              Event Log
            </h2>
            <button type="button" className={styles.demoToggle} onClick={() => setLogs([])}>
              پاک کردن
            </button>
          </div>
          <pre className={styles.demoLog}>
            {logs.length === 0
              ? '// هنوز لاگی نیست'
              : logs.map((l) => `[${l.at}] ${l.message}`).join('\n')}
          </pre>
        </section>

        <footer className={styles.footer}>
          <span>
            <code>npm run dev</code> = playground · <code>npm run dev:docs</code> = landing
          </span>
          <span>Published APIs only</span>
        </footer>
      </div>
    </div>
  );
}
