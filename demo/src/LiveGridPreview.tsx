import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  applyImportedRows,
  createEngineGridQuery,
  ERPTable,
  exportActiveCollectionToExcel,
  mapImportedSheet,
  parseXlsxBlob,
  RowStateEnum,
  ExcelImportPlugin,
  themeErp,
  type CellComponentMap,
  type IMultiSelectConfig,
  type UITableController,
} from 'persian-data-grid';
import {
  createVazirmatnPdfExportPlugin,
  createVazirmatnPdfRenderer,
} from 'persian-data-grid/plugins/pdf/fonts/vazirmatn';

import {
  buildVoucherDemoRows,
  VOUCHER_COLUMNS,
  VOUCHER_DATA_COLUMNS,
} from './fixtures';
import { DemoMockRemoteApi } from './mockRemoteApi';
import styles from './site.module.css';

const remoteApi = new DemoMockRemoteApi(80);
const ROW_COUNTS = [10, 50, 200, 1000, 2000] as const;
const PAGE_SIZES = [9, 20, 50] as const;
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const SEARCH_COLUMNS = VOUCHER_DATA_COLUMNS.filter(
  (col) => col.visibility?.kind === 'always',
);

const checkboxHostComponents: CellComponentMap = {
  checkbox: (ctx) => (
    <label
      data-erp-cell-component="checkbox"
      className="flex w-full justify-center"
    >
      <input
        type="checkbox"
        checked={ctx.value === true}
        disabled={ctx.isDeleted || !ctx.isEditable}
        onChange={(e) => ctx.dispatchChangeValue(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
      />
    </label>
  ),
};

function faNum(n: number) {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

const multiSelectConfig: IMultiSelectConfig = {
  dynamicValue: { endpoint: '/api/demo/select/account' },
  fieldKey: '_SelectId',
  detailFieldKey: 'id',
  onAdd: () => undefined,
  ListConfig: [
    { fieldName: 'index', fieldCaption: '#', fieldType: 'index' },
    {
      fieldName: '_SelectDisplay',
      fieldCaption: 'سرفصل حساب',
      fieldType: 'text',
    },
  ],
};

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

type LogItem = { at: string; message: string };
type SessionHistoryItem = {
  type: string;
  title: string;
  description: string;
  occurredAt: number;
};

const NOISY_HISTORY = new Set([
  'VIEWPORT_CHANGED',
  'PAGE_SIZE_CHANGED',
  'ROWS_LOADED',
  'TABLE_REGISTERED',
]);

function cellSearchText(controller: UITableController, rowId: number, columnId: string) {
  const cell = controller.getCell(rowId, columnId);
  const display = cell?.getDisplay();
  if (display != null && display !== '') return String(display);
  return String(cell?.getValue() ?? '');
}

function formatClock(value = Date.now()) {
  return new Date(value).toLocaleTimeString('fa-IR', { hour12: false });
}

export type LiveGridPreviewProps = {
  tableKey: string;
  tableHeight?: number;
  tableTitle?: string;
  recordPerPage?: number;
  compact?: boolean;
  showStatus?: boolean;
  showToolbar?: boolean;
};

/**
 * Live published grid for demo landing / playground.
 * Page chrome stays outside this component.
 */
export function LiveGridPreview({
  tableKey,
  tableHeight = 400,
  tableTitle = 'اقلام سند',
  recordPerPage = 9,
  compact = false,
  showStatus = true,
  showToolbar,
}: LiveGridPreviewProps) {
  const toolbar = showToolbar ?? !compact;
  const [controller, setController] = useState<UITableController | null>(null);
  const [rowCount, setRowCount] = useState<(typeof ROW_COUNTS)[number]>(50);
  const [pageSize, setPageSize] = useState(recordPerPage);
  const [virtualization, setVirtualization] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [searchColumn, setSearchColumn] = useState(SEARCH_COLUMNS[0]?.fieldName ?? 'DetailDesc');
  const [searchQuery, setSearchQuery] = useState('');
  const [qaAccent, setQaAccent] = useState(false);
  const [qaTallRows, setQaTallRows] = useState(false);
  const [matchIndex, setMatchIndex] = useState(-1);
  const [matchTotal, setMatchTotal] = useState(0);
  const [actionLogs, setActionLogs] = useState<LogItem[]>([]);
  const [historyItems, setHistoryItems] = useState<SessionHistoryItem[]>([]);
  const [historySince, setHistorySince] = useState(() => Date.now());

  const rows = useMemo(() => buildVoucherDemoRows(rowCount), [rowCount]);
  const columns = useMemo(() => VOUCHER_COLUMNS, []);
  const plugins = useMemo(
    () => [createVazirmatnPdfExportPlugin({ download: true }), new ExcelImportPlugin()],
    [],
  );
  const instanceKey = `${tableKey}-r${rowCount}-h${qaTallRows ? 48 : 40}`;
  const showLog = toolbar;
  const qaTheme = useMemo(() => {
    if (!qaAccent && !qaTallRows) return undefined;
    return themeErp.withParams({
      ...(qaAccent ? { accentColor: 'hotpink' } : {}),
      ...(qaTallRows ? { rowHeight: 48 } : {}),
    });
  }, [qaAccent, qaTallRows]);

  const pushLog = useCallback((message: string) => {
    setActionLogs((prev) => [{ at: formatClock(), message }, ...prev].slice(0, 80));
  }, []);

  const historyLines = useMemo(() => {
    return historyItems
      .filter((item) => !NOISY_HISTORY.has(item.type))
      .filter((item) => item.occurredAt > historySince)
      .slice(-40)
      .reverse()
      .map((item) => {
        const detail = item.description ? ` — ${item.description}` : '';
        return `[${formatClock(item.occurredAt)}] ${item.type}: ${item.title}${detail}`;
      });
  }, [historyItems, historySince]);

  useEffect(() => {
    if (!controller) return;
    const sync = () => {
      setCanUndo(controller.canUndo());
      setCanRedo(controller.canRedo());
    };
    sync();
    const unsub = controller.subscribe(sync);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [controller]);

  useEffect(() => {
    if (!controller) {
      setHistoryItems([]);
      return;
    }
    setHistorySince(Date.now());
    setHistoryItems(controller.getHistoryItems());
    const unsub = controller.subscribeHistoryItems((items) => {
      setHistoryItems(items);
    });
    pushLog(`گرید آماده شد · ${faNum(rowCount)} سطر`);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [controller, pushLog, rowCount]);

  const runSearch = async (nextIndex = 0) => {
    if (!controller) return;
    const query = searchQuery.trim();
    if (!query) {
      await controller.dispatch({ type: 'UI_CLEAR_GRID_SEARCH' });
      setMatchIndex(-1);
      setMatchTotal(0);
      pushLog('جستجو پاک شد');
      return;
    }
    const q = query.toLowerCase();
    const matches = (controller.getAllRows() ?? [])
      .filter((row) => row.rowState.value !== RowStateEnum.Deleted)
      .filter((row) =>
        cellSearchText(controller, row.id.value, searchColumn).toLowerCase().includes(q),
      )
      .map((row) => ({ rowId: row.id.value, columnId: searchColumn }));
    const index = matches.length ? Math.min(Math.max(nextIndex, 0), matches.length - 1) : -1;
    setMatchTotal(matches.length);
    setMatchIndex(index);
    await controller.dispatch({
      type: 'UI_SET_GRID_SEARCH',
      search:
        matches.length === 0
          ? { columnId: searchColumn, query, matches: [], currentIndex: -1 }
          : { columnId: searchColumn, query, matches, currentIndex: index },
    });
    if (!matches.length) {
      pushLog(`جستجو col=${searchColumn} q="${query}" · بدون نتیجه`);
      return;
    }
    const match = matches[index];
    if (!match) return;
    const view = controller.getViewState();
    if (view && !virtualization) {
      const ordered = (controller.getAllRows() ?? []).filter(
        (row) => row.rowState.value !== RowStateEnum.Deleted,
      );
      const abs = ordered.findIndex((row) => row.id.value === match.rowId);
      if (abs >= 0) {
        const page = Math.ceil((abs + 1) / view.pagination.pageSize);
        if (page && page !== view.pagination.page) {
          await controller.dispatch({ type: 'CHANGE_PAGE', page });
        }
      }
    }
    await controller.dispatch({ type: 'UI_ACTIVE_ROW', rowId: match.rowId });
    pushLog(
      `جستجو col=${searchColumn} q="${query}" · ${index + 1}/${matches.length} · row=${match.rowId}`,
    );
  };

  const importXlsx = () => {
    if (!controller) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      void (async () => {
        setBusy(true);
        try {
          const session = controller.getSession();
          if (!session) throw new Error('session missing');
          const source = createEngineGridQuery(session.getEngine()).getExportSource('active');
          if (!source) throw new Error('NO_IMPORT_TARGET');
          const sheet = await parseXlsxBlob(new Uint8Array(await file.arrayBuffer()));
          const mapped = mapImportedSheet(sheet, source.columns);
          if (mapped.columns.length === 0) throw new Error('NO_COLUMN_MATCH');
          const result = await applyImportedRows(session, mapped.rows);
          const message = `ورود اکسل: ${result.rowCount} سطر از ${file.name}`;
          setStatus(message);
          pushLog(message);
        } catch (e) {
          setStatus(`ورود اکسل ناموفق: ${e instanceof Error ? e.message : String(e)}`);
          pushLog(`ورود اکسل ناموفق: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
          setBusy(false);
        }
      })();
    };
    input.click();
  };

  return (
    <div
      className={`${styles.erpHost} ${compact ? styles.erpHostCompact : ''}`}
      dir="rtl"
    >
      {toolbar ? (
        <div className={styles.liveToolbar} data-demo-no-nav>
          <div className={styles.demoToolbar}>
            <span className={styles.liveToolbarLabel}>سطرها</span>
            <div className={styles.liveCountGroup} role="group" aria-label="تعداد سطر">
              {ROW_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.demoToggle} ${styles.liveCountBtn} ${
                    rowCount === n ? styles.liveCountBtnActive : ''
                  }`}
                  onClick={() => {
                    setController(null);
                    setRowCount(n);
                    setStatus(null);
                    pushLog(`سطرها → ${faNum(n)}`);
                  }}
                >
                  {faNum(n)}
                </button>
              ))}
            </div>
            <span className={styles.liveToolbarLabel}>نمایش</span>
            <button
              type="button"
              className={`${styles.demoToggle} ${!virtualization ? styles.demoToggleActive : ''}`}
              onClick={() => {
                setVirtualization(false);
                pushLog('حالت نمایش → صفحه‌بندی');
              }}
            >
              صفحه‌بندی
            </button>
            <button
              type="button"
              className={`${styles.demoToggle} ${virtualization ? styles.demoToggleActive : ''}`}
              onClick={() => {
                setVirtualization(true);
                pushLog('حالت نمایش → اسکرول مجازی');
              }}
            >
              اسکرول مجازی
            </button>
            <span className={styles.liveToolbarLabel}>آزمایش تم</span>
            <button
              type="button"
              className={`${styles.demoToggle} ${qaAccent ? styles.demoToggleActive : ''}`}
              onClick={() => {
                setQaAccent((value) => !value);
                pushLog('تم آزمایشی → accent hotpink');
              }}
            >
              صورتی
            </button>
            <button
              type="button"
              className={`${styles.demoToggle} ${qaTallRows ? styles.demoToggleActive : ''}`}
              onClick={() => {
                setQaTallRows((value) => !value);
                pushLog('ارتفاع سطر → ۴۸');
              }}
            >
              سطر ۴۸
            </button>
            {!virtualization ? (
              <>
                <span className={styles.liveToolbarLabel}>در صفحه</span>
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`${styles.demoToggle} ${pageSize === size ? styles.demoToggleActive : ''}`}
                    disabled={!controller}
                    onClick={async () => {
                      if (!controller) return;
                      setPageSize(size);
                      await controller.dispatch({ type: 'CHANGE_PAGE_SIZE', pageSize: size });
                      pushLog(`اندازه صفحه → ${faNum(size)}`);
                    }}
                  >
                    {faNum(size)}
                  </button>
                ))}
              </>
            ) : null}
          </div>

          <div className={styles.demoToolbar}>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller || !canUndo}
              onClick={async () => {
                if (!controller) return;
                const ok = await controller.undo();
                const message = ok ? 'بازگردانی انجام شد' : 'چیزی برای بازگردانی نیست';
                setStatus(message);
                pushLog(`undo → ${ok}`);
              }}
            >
              بازگردانی
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller || !canRedo}
              onClick={async () => {
                if (!controller) return;
                const ok = await controller.redo();
                const message = ok ? 'باز انجام شد' : 'چیزی برای باز انجام نیست';
                setStatus(message);
                pushLog(`redo → ${ok}`);
              }}
            >
              باز انجام
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller}
              onClick={async () => {
                if (!controller) return;
                await controller.dispatch({ type: 'ADD_EMPTY_ROW' });
                setStatus('سطر خالی اضافه شد');
                pushLog('ADD_EMPTY_ROW');
              }}
            >
              افزودن سطر
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller}
              onClick={async () => {
                if (!controller) return;
                const rowId = controller.getActiveRow();
                if (rowId == null) {
                  setStatus('اول یک سطر را انتخاب کنید');
                  pushLog('تکثیر سطر · سطری انتخاب نشده');
                  return;
                }
                await controller.dispatch({ type: 'DUPLICATE_ROW', rowId });
                setStatus('سطر تکثیر شد');
                pushLog(`DUPLICATE_ROW ${rowId}`);
              }}
            >
              تکثیر سطر
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller}
              onClick={async () => {
                if (!controller) return;
                const rowId = controller.getActiveRow();
                if (rowId == null) {
                  setStatus('اول یک سطر را انتخاب کنید');
                  pushLog('حذف سطر · سطری انتخاب نشده');
                  return;
                }
                await controller.dispatch({ type: 'ROW_DELETED', rowId });
                setStatus('سطر حذف شد');
                pushLog(`ROW_DELETED ${rowId}`);
              }}
            >
              حذف سطر
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller || busy}
              onClick={async () => {
                if (!controller) return;
                setBusy(true);
                try {
                  await exportActiveCollectionToExcel(controller, {
                    download: true,
                    fileName: `grid-${new Date().toISOString().slice(0, 10)}.xlsx`,
                    direction: 'rtl',
                  });
                  setStatus('خروجی اکسل آماده شد');
                  pushLog('خروجی اکسل');
                } catch (e) {
                  setStatus(`خروجی اکسل ناموفق: ${e instanceof Error ? e.message : String(e)}`);
                  pushLog(`خروجی اکسل ناموفق: ${e instanceof Error ? e.message : String(e)}`);
                } finally {
                  setBusy(false);
                }
              }}
            >
              خروجی اکسل
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller || busy}
              onClick={importXlsx}
            >
              ورود از اکسل
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller || busy}
              onClick={async () => {
                if (!controller) return;
                setBusy(true);
                try {
                  const session = controller.getSession();
                  if (!session) throw new Error('session missing');
                  const source = createEngineGridQuery(session.getEngine()).getExportSource(
                    'active',
                  );
                  if (!source) throw new Error('NO_COLUMNS');
                  const blob = await createVazirmatnPdfRenderer().render(source, {
                    title: tableTitle || 'اقلام سند',
                    direction: 'rtl',
                  });
                  downloadBlob(blob, `grid-${new Date().toISOString().slice(0, 10)}.pdf`);
                  setStatus('خروجی PDF آماده شد');
                  pushLog('خروجی PDF');
                } catch (e) {
                  setStatus(`خروجی PDF ناموفق: ${e instanceof Error ? e.message : String(e)}`);
                  pushLog(`خروجی PDF ناموفق: ${e instanceof Error ? e.message : String(e)}`);
                } finally {
                  setBusy(false);
                }
              }}
            >
              خروجی PDF
            </button>
          </div>

          <div className={`${styles.demoToolbar} ${styles.searchBar}`}>
            <span className={styles.liveToolbarLabel}>جستجو</span>
            <select
              className={styles.demoSelect}
              value={searchColumn}
              onChange={(e) => setSearchColumn(e.target.value)}
            >
              {SEARCH_COLUMNS.map((col) => (
                <option key={col.fieldName} value={col.fieldName}>
                  {col.fieldCaption}
                </option>
              ))}
            </select>
            <input
              className={styles.demoSearchInput}
              placeholder="متن جستجو…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runSearch(0);
              }}
            />
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller}
              onClick={() => void runSearch(0)}
            >
              پیدا کن
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={matchTotal === 0}
              onClick={() =>
                void runSearch((matchIndex - 1 + matchTotal) % matchTotal)
              }
            >
              قبلی
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={matchTotal === 0}
              onClick={() => void runSearch((matchIndex + 1) % matchTotal)}
            >
              بعدی
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={!controller || (!searchQuery && matchTotal === 0)}
              onClick={async () => {
                setSearchQuery('');
                if (!controller) return;
                await controller.dispatch({ type: 'UI_CLEAR_GRID_SEARCH' });
                setMatchIndex(-1);
                setMatchTotal(0);
                pushLog('جستجو پاک شد');
              }}
            >
              پاک کردن جستجو
            </button>
            <span className={styles.liveToolbarLabel}>
              {matchTotal === 0 ? 'بدون نتیجه' : `${faNum(matchIndex + 1)} / ${faNum(matchTotal)}`}
            </span>
          </div>

          {status ? <p className={styles.demoHint}>{status}</p> : null}
        </div>
      ) : null}

      {showStatus && !compact ? (
        <div className={styles.erpHostMeta}>
          <span className={styles.statusChip}>
            {controller ? `${faNum(rowCount)} سطر` : 'در حال آماده‌سازی…'}
          </span>
        </div>
      ) : null}

      <ERPTable
        key={instanceKey}
        actor={{ userId: 'demo', roles: ['admin'] }}
        store="demo-store"
        tableKey={instanceKey}
        rows={rows}
        columns={columns}
        tableHeight={tableHeight}
        recordPerPage={pageSize}
        tableTitle={tableTitle}
        virtualization={virtualization}
        remoteApi={remoteApi}
        locale="fa"
        multiSelectConfig={multiSelectConfig}
        theme={qaTheme}
        components={checkboxHostComponents}
        plugins={plugins}
        footer={true}
        onReady={setController}
      />

      {showLog ? (
        <div className={styles.liveLog} data-demo-no-nav>
          <div className={`${styles.demoToolbar} ${styles.demoToolbarBetween}`}>
            <h3 className={styles.liveLogTitle}>لاگ رویدادها</h3>
            <button
              type="button"
              className={styles.demoToggle}
              onClick={() => {
                setActionLogs([]);
                setHistorySince(Date.now());
              }}
            >
              پاک کردن
            </button>
          </div>
          <pre className={styles.demoLog}>
            {actionLogs.length === 0 && historyLines.length === 0
              ? '// هنوز لاگی نیست'
              : [
                  ...actionLogs.map((item) => `[${item.at}] ${item.message}`),
                  ...historyLines,
                ].join('\n')}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
