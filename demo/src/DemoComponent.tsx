import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createERPTable,
  ExcelExportPlugin,
  ExcelImportPlugin,
  PdfExportPlugin,
  VirtualList,
  type ColumnSchema,
  type CreateERPTableResult,
} from '@fallahi/erp-table';

import { DemoDateCell } from './DemoDateCell';
import { DemoIndexCol } from './DemoIndexCol';
import {
  buildGridTemplate,
  cellText,
  draggedRowIdRef,
  findMatches,
  flattenCells,
  getDataColumns,
  getIndexColumnMeta,
  isColumnVisibleForRow,
  parseCellInput,
  type DisplayRow,
} from './demoHelpers';
import { buildDemoRows, DEMO_COLUMNS, ensureDemoColumns } from './fixtures';
import { DemoMockRemoteApi } from './mockRemoteApi';
import styles from './site.module.css';

type LogItem = { at: string; message: string };
type ViewMode = 'virtual' | 'paged';

export default function DemoComponent() {
  const [grid, setGrid] = useState<CreateERPTableResult | null>(null);
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [allRows, setAllRows] = useState<DisplayRow[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(200);
  const [viewMode, setViewMode] = useState<ViewMode>('virtual');
  const [overlapOn, setOverlapOn] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [searchColumn, setSearchColumn] = useState('item');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(-1);
  const [matches, setMatches] = useState<Array<{ rowId: number; columnId: string }>>([]);
  const [activeCell, setActiveCell] = useState<{ rowId: number; columnId: string } | null>(
    null,
  );
  const [schemaColumns, setSchemaColumns] = useState<ColumnSchema[]>(() =>
    ensureDemoColumns(DEMO_COLUMNS),
  );
  const [, bump] = useState(0);

  const [dropTarget, setDropTarget] = useState<{
    rowId: number;
    position: 'before' | 'after';
  } | null>(null);

  const pushLog = useCallback((message: string) => {
    const at = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs((prev) => [{ at, message }, ...prev].slice(0, 40));
  }, []);

  const refresh = useCallback(
    (result: CreateERPTableResult, mode: ViewMode) => {
      const snap = result.session.getSnapShot('active');
      const view = result.session.getViewState();
      const vcById = new Map(
        (view?.rows ?? []).map((r) => [r.id, r.visibilityCondition ?? {}]),
      );

      const snapRows: DisplayRow[] = (snap?.rows ?? []).map((r) => ({
        id: r.id,
        cells: flattenCells(r.cells as Record<string, unknown>),
        visibilityCondition: vcById.get(r.id) ?? {},
      }));
      setAllRows(snapRows);

      if (view?.pagination) {
        setPage(view.pagination.page);
        setPageSize(view.pagination.pageSize);
        setTotalPages(view.pagination.totalPages);
        setTotalRows(view.pagination.totalRows);
      }

      const liveCols =
        view?.activeCollectionColumn?.length
          ? view.activeCollectionColumn
          : view?.columns?.length
            ? view.columns
            : ensureDemoColumns(DEMO_COLUMNS);
      setSchemaColumns(ensureDemoColumns(liveCols));

      if (mode === 'paged' && view) {
        setRows(
          view.rows.map((r) => ({
            id: r.id,
            cells: flattenCells(r.cells as Record<string, unknown>),
            visibilityCondition: r.visibilityCondition ?? {},
          })),
        );
      } else {
        setRows(snapRows);
      }

      setHistory(
        result.session.getHistoryItems().slice(0, 12).map((h) => `${h.type}: ${h.title}`),
      );
      const nextActive = result.controller.getActiveCell() ?? null;
      setActiveCell(nextActive);
      bump((n) => n + 1);
    },
    [],
  );

  const boot = useCallback(
    async (count: number, mode: ViewMode) => {
      setError(null);
      try {
        const result = await createERPTable({
          store: 'demo-store',
          // Bump key so IndexedDB picks up product/resolveOn schema (not stale demo-lines).
          tableKey: 'demo-lines-product',
          actor: { userId: 'demo', roles: ['admin'] },
          tableType: 'default',
          activeCollection: 'default',
          columns: ensureDemoColumns(DEMO_COLUMNS),
          rows: buildDemoRows(count),
          remoteApi: new DemoMockRemoteApi(),
          plugins: [
            new ExcelExportPlugin({ download: true }),
            new ExcelImportPlugin({
              onImported: ({ rowCount, columnCount }) => {
                pushLog(`imported ${rowCount} rows × ${columnCount} cols → IndexedDB`);
              },
            }),
            new PdfExportPlugin({ download: true }),
          ],
        });
        if (mode === 'paged') {
          await result.session.dispatchViewIntent({
            type: 'CHANGE_PAGE_SIZE',
            pageSize: 10,
          });
          await result.session.dispatchViewIntent({ type: 'CHANGE_PAGE', page: 1 });
        }
        setGrid(result);
        refresh(result, mode);
        pushLog(`booted createERPTable · ${count} rows · mode=${mode}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [pushLog, refresh],
  );

  useEffect(() => {
    void boot(rowCount, viewMode);
  }, [boot, rowCount, viewMode]);

  useEffect(() => {
    if (!grid) return;
    return grid.session.subscribe(() => refresh(grid, viewMode));
  }, [grid, refresh, viewMode]);

  // Same path as host ERPTable (ui/index.tsx): window keydown → KEY_DOWN → session keyboard handler.
  useEffect(() => {
    if (!grid) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-demo-no-nav]')) return;

      const navKeys = new Set([
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Tab',
        'Enter',
        'NumpadEnter',
      ]);
      if (!navKeys.has(e.code) && !(e.altKey && ['KeyN', 'KeyD', 'Delete'].includes(e.code))) {
        return;
      }

      let activeRow = grid.controller.getActiveRow();
      let cell = grid.controller.getActiveCell();

      // If focus is in a demo cell but engine has no active cell yet, sync from DOM.
      if ((!activeRow || !cell) && target) {
        const host = target.closest('[data-demo-cell]') as HTMLElement | null;
        const token = host?.dataset.demoCell;
        if (token) {
          const [rowIdRaw, columnId] = token.split(':');
          const rowId = Number(rowIdRaw);
          if (Number.isFinite(rowId) && columnId) {
            void grid.controller.dispatch({
              type: 'UI_ACTIVE_CELL',
              rowId,
              columnId,
            });
            activeRow = rowId;
            cell = { rowId, columnId };
          }
        }
      }

      // Host keyboard map is RTL (ArrowLeft = next). Demo is LTR — flip horizontal arrows.
      if (
        (e.code === 'ArrowLeft' || e.code === 'ArrowRight') &&
        activeRow != null &&
        cell?.columnId
      ) {
        e.preventDefault();
        e.stopPropagation();
        void grid.session.dispatchViewIntent({
          type: 'MOVE_ACTIVE_CELL',
          rowId: activeRow,
          columnId: cell.columnId,
          direction: e.code === 'ArrowRight' ? 'next' : 'prev',
        });
        return;
      }

      if (
        (e.code === 'ArrowUp' || e.code === 'ArrowDown') &&
        activeRow != null &&
        cell?.columnId
      ) {
        e.preventDefault();
        e.stopPropagation();
        void grid.session.dispatchViewIntent({
          type: 'MOVE_ACTIVE_CELL_VERTICAL',
          rowId: activeRow,
          columnId: cell.columnId,
          direction: e.code === 'ArrowDown' ? 'down' : 'up',
        });
        return;
      }

      void grid.controller.dispatch({
        type: 'KEY_DOWN',
        event: e,
        ctx: {
          tableKey: grid.session.tableKey,
          activeRowId: activeRow,
          activeColumnId: cell?.columnId ?? null,
        },
      });
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [grid]);

  // Keep DOM focus on the engine active cell after keyboard moves.
  useEffect(() => {
    if (!activeCell) return;
    const id = window.requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-demo-cell="${activeCell.rowId}:${activeCell.columnId}"]`,
      );
      if (el && document.activeElement !== el) {
        el.focus();
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [activeCell]);

  const onCellChange = async (rowId: number, columnId: string, value: string) => {
    if (!grid) return;
    const parsed = parseCellInput(schemaColumns, columnId, value);
    await grid.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: grid.session.store,
      tableKey: grid.session.tableKey,
      rowId,
      columnId,
      newValue: parsed,
    });
    if (columnId === 'productId') {
      pushLog(
        `productId=${JSON.stringify(parsed)} → resolveOn mock API (fill name/price + flags)`,
      );
    } else {
      pushLog(`CHANGE_CELL_VALUE row=${rowId} ${columnId}=${JSON.stringify(parsed)}`);
    }
  };

  const reorderRow = async (
    draggedRowId: number,
    droppedRowId: number,
    position: 'before' | 'after',
  ) => {
    if (!grid || draggedRowId === droppedRowId) return;
    await grid.controller.dispatch({
      type: 'ROW_REORDERED',
      draggedRowId,
      droppedRowId,
      position,
    });
    pushLog(`ROW_REORDERED ${draggedRowId} → ${position} ${droppedRowId}`);
  };

  const runSearch = async (query = searchQuery, columnId = searchColumn) => {
    if (!grid) return;
    const found = findMatches(allRows, columnId, query);
    setMatches(found);
    const index = found.length ? 0 : -1;
    setMatchIndex(index);
    await grid.session.dispatchViewIntent({
      type: 'SET_GRID_SEARCH',
      search:
        found.length === 0
          ? null
          : { columnId, query: query.trim(), matches: found, currentIndex: index },
    });
    pushLog(`SET_GRID_SEARCH col=${columnId} q="${query}" matches=${found.length}`);
    if (found.length && viewMode === 'paged') {
      const abs = allRows.findIndex((r) => r.id === found[0].rowId);
      if (abs >= 0) {
        const targetPage = Math.floor(abs / pageSize) + 1;
        await grid.session.dispatchViewIntent({ type: 'CHANGE_PAGE', page: targetPage });
      }
    }
  };

  const goMatch = async (direction: 1 | -1) => {
    if (!grid || matches.length === 0) return;
    const next = (matchIndex + direction + matches.length) % matches.length;
    setMatchIndex(next);
    await grid.session.dispatchViewIntent({
      type: 'SET_GRID_SEARCH',
      search: {
        columnId: searchColumn,
        query: searchQuery.trim(),
        matches,
        currentIndex: next,
      },
    });
    const hit = matches[next];
    if (viewMode === 'paged') {
      const abs = allRows.findIndex((r) => r.id === hit.rowId);
      if (abs >= 0) {
        const targetPage = Math.floor(abs / pageSize) + 1;
        await grid.session.dispatchViewIntent({ type: 'CHANGE_PAGE', page: targetPage });
      }
    }
    pushLog(`search match ${next + 1}/${matches.length} row=${hit.rowId}`);
  };

  const activeMatchRowId = matchIndex >= 0 ? matches[matchIndex]?.rowId : null;
  const columns = schemaColumns;
  const indexMeta = useMemo(() => getIndexColumnMeta(columns), [columns]);
  // IndexCol is always rendered first; data columns follow by schema order (!hidden).
  const dataColumns = useMemo(() => getDataColumns(columns), [columns]);
  const gridTemplateColumns = buildGridTemplate(dataColumns.length);
  const searchColumns = dataColumns.filter((c) => c.visibility?.kind === 'always');

  const renderRow = (row: DisplayRow, idx: number) => {
    if (!grid) return null;
    const isMatch = activeMatchRowId === row.id;
    const dropBefore = dropTarget?.rowId === row.id && dropTarget.position === 'before';
    const dropAfter = dropTarget?.rowId === row.id && dropTarget.position === 'after';

    return (
      <div
        key={row.id}
        data-demo-row
        className={[
          styles.gridRow,
          overlapOn ? styles.gridRowOverlap : '',
          isMatch ? styles.gridRowMatch : '',
          dropBefore ? styles.dropBefore : '',
          dropAfter ? styles.dropAfter : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ gridTemplateColumns }}
        draggable={false}
        onDragStart={(e) => {
          draggedRowIdRef.current = row.id;
          e.dataTransfer.setData('text/plain', String(row.id));
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
          setDropTarget({ rowId: row.id, position });
        }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={(e) => {
          e.preventDefault();
          const source = draggedRowIdRef.current;
          const position = dropTarget?.position ?? 'after';
          setDropTarget(null);
          draggedRowIdRef.current = null;
          e.currentTarget.setAttribute('draggable', 'false');
          if (source != null) void reorderRow(source, row.id, position);
        }}
        onDragEnd={(e) => {
          draggedRowIdRef.current = null;
          setDropTarget(null);
          e.currentTarget.setAttribute('draggable', 'false');
        }}
      >
        <div className={`${styles.stickyCell} ${styles.indexSticky}`}>
          <DemoIndexCol
            grid={grid}
            meta={indexMeta}
            row={row}
            idx={idx}
            onLog={pushLog}
          />
        </div>

        {dataColumns.map((col) => {
          const visible = isColumnVisibleForRow(col, row.visibilityCondition);
          if (!visible) {
            return (
              <span
                key={col.fieldName}
                className={styles.staticCell}
                title="Hidden until product resolveOn flag is true"
                style={{ opacity: 0.35 }}
              >
                —
              </span>
            );
          }

          const display = cellText(row.cells, col.fieldName);
          const cellKey = `${row.id}:${col.fieldName}`;
          const isActive =
            activeCell?.rowId === row.id && activeCell.columnId === col.fieldName;
          const cellClass = isActive ? styles.gridCellActive : undefined;

          if (col.fieldType === 'static' || col.editable === false) {
            return (
              <span
                key={`${cellKey}:${display}`}
                className={`${styles.staticCell} ${cellClass ?? ''}`}
                data-demo-cell={cellKey}
                tabIndex={0}
                onFocus={() => {
                  void grid.controller.dispatch({
                    type: 'UI_ACTIVE_CELL',
                    rowId: row.id,
                    columnId: col.fieldName,
                  });
                }}
              >
                {display || '—'}
              </span>
            );
          }
          if (col.fieldType === 'date') {
            return (
              <div
                key={col.fieldName}
                className={`${styles.dateCell} ${cellClass ?? ''}`}
                data-demo-cell={cellKey}
                tabIndex={0}
                onFocus={() => {
                  void grid.controller.dispatch({
                    type: 'UI_ACTIVE_CELL',
                    rowId: row.id,
                    columnId: col.fieldName,
                  });
                }}
              >
                <DemoDateCell
                  value={row.cells[col.fieldName]}
                  onCommit={(v) => void onCellChange(row.id, col.fieldName, v)}
                />
              </div>
            );
          }
          if (col.fieldType === 'selectOption' && col.selectOptions?.length) {
            return (
              <select
                key={cellKey}
                data-demo-cell={cellKey}
                className={cellClass}
                value={display}
                onFocus={() => {
                  void grid.controller.dispatch({
                    type: 'UI_ACTIVE_CELL',
                    rowId: row.id,
                    columnId: col.fieldName,
                  });
                }}
                onChange={(e) => void onCellChange(row.id, col.fieldName, e.target.value)}
              >
                <option value="">Select…</option>
                {col.selectOptions.map((opt) => (
                  <option key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <input
              key={`${cellKey}:${display}`}
              data-demo-cell={cellKey}
              className={cellClass}
              defaultValue={display}
              onFocus={() => {
                void grid.controller.dispatch({
                  type: 'UI_ACTIVE_CELL',
                  rowId: row.id,
                  columnId: col.fieldName,
                });
              }}
              onBlur={(e) => void onCellChange(row.id, col.fieldName, e.target.value)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${styles.page} ${styles.pageEn}`} dir="ltr">
      <div className={`${styles.shell} ${styles.demoStack}`}>
        <header className={styles.topbar}>
          <div className={styles.brandMark}>
            <span className={styles.logo} aria-hidden />
            <span className={styles.brandText}>
              <span className={styles.brandName}>ERP Table Playground</span>
              <span className={styles.brandSub}>
                Manual QA · IndexCol · DnD · search · pagination · Jalali mask
              </span>
            </span>
          </div>
        </header>

        <section className={styles.demoCard} data-demo-no-nav>
          <span className={styles.demoBadge}>
            <span className={styles.liveDot} aria-hidden />
            DEV · VITE_APP_MODE=dev
          </span>
          <h1 className={styles.demoCardTitle} style={{ fontSize: '1.45rem' }}>
            Interactive QA Playground
          </h1>
          <p className={styles.demoCardLead}>
            Product column uses voucher-style <code>resolveOn</code>: pick P100–P400 → mock API
            fills Product name + Price, then shows Lot # / Warehouse via{' '}
            <code>whenRemoteFlag</code> (same pattern as AccountId → FifthId / CurrencyId).
          </p>

          <div className={styles.demoToolbar}>
            <span className={styles.demoCardLead} style={{ margin: 0 }}>
              Rows:
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
              className={`${styles.demoToggle} ${viewMode === 'virtual' ? styles.demoToggleActive : ''}`}
              onClick={() => setViewMode('virtual')}
            >
              VirtualList
            </button>
            <button
              type="button"
              className={`${styles.demoToggle} ${viewMode === 'paged' ? styles.demoToggleActive : ''}`}
              onClick={() => setViewMode('paged')}
            >
              Pagination
            </button>
            <button
              type="button"
              className={`${styles.demoToggle} ${overlapOn ? styles.demoToggleActive : ''}`}
              onClick={() => setOverlapOn((v) => !v)}
            >
              Sticky IndexCol
            </button>
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
              onClick={() => {
                if (!grid) return;
                const input = document.createElement('input');
                input.type = 'file';
                input.accept =
                  '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                input.onchange = () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  void (async () => {
                    try {
                      await grid.pluginHost.requestImport({
                        format: 'xlsx',
                        data: file,
                      });
                      pushLog(`requestImport xlsx · ${file.name}`);
                      refresh(grid, viewMode);
                    } catch (e) {
                      pushLog(
                        `import failed · ${e instanceof Error ? e.message : String(e)}`,
                      );
                    }
                  })();
                };
                input.click();
              }}
            >
              Import XLSX
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

          <div className={`${styles.demoToolbar} ${styles.searchBar}`}>
            <span className={styles.demoCardLead} style={{ margin: 0 }}>
              Search:
            </span>
            <select
              className={styles.demoSelect}
              value={searchColumn}
              onChange={(e) => setSearchColumn(e.target.value)}
            >
              {searchColumns.map((c) => (
                <option key={c.fieldName} value={c.fieldName}>
                  {c.fieldCaption}
                </option>
              ))}
            </select>
            <input
              className={styles.demoSearchInput}
              placeholder="Search text…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runSearch();
              }}
            />
            <button
              type="button"
              className={styles.demoToggle}
              onClick={() => void runSearch()}
            >
              Find
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={matches.length === 0}
              onClick={() => void goMatch(-1)}
            >
              Prev
            </button>
            <button
              type="button"
              className={styles.demoToggle}
              disabled={matches.length === 0}
              onClick={() => void goMatch(1)}
            >
              Next
            </button>
            <span className={styles.demoCardLead} style={{ margin: 0 }}>
              {matches.length === 0
                ? 'No matches'
                : `${matchIndex + 1} / ${matches.length}`}
            </span>
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
              {viewMode === 'virtual' ? 'VirtualList' : 'Paged table'}
            </h2>
            <span className={styles.demoCardLead} style={{ margin: 0 }}>
              {viewMode === 'paged'
                ? `Page ${page} of ${totalPages} · ${totalRows} rows`
                : `${rows.length} rows`}
              {overlapOn ? ' · sticky IndexCol on' : ''}
            </span>
          </div>

          {overlapOn && (
            <p className={styles.demoHint}>
              Scroll the grid horizontally — IndexCol stays fixed and overlays scrolling cells
              (demo-only sticky chrome).
            </p>
          )}

          {grid ? (
            <div
              className={`${styles.gridShell} ${overlapOn ? styles.gridShellOverlap : ''}`}
            >
              {viewMode === 'virtual' && !overlapOn ? (
                <div className={styles.gridScroll}>
                  <div
                    className={styles.gridHeader}
                    style={{ gridTemplateColumns }}
                  >
                    <span>{indexMeta.fieldCaption}</span>
                    {dataColumns.map((col) => (
                      <span key={col.fieldName}>{col.fieldCaption}</span>
                    ))}
                  </div>
                  <VirtualList
                    session={grid.session}
                    items={rows}
                    height={360}
                    rowHeight={44}
                    overscan={4}
                    getItemKey={(row) => row.id}
                    renderItem={(row, absoluteIndex) => renderRow(row, absoluteIndex)}
                  />
                </div>
              ) : (
                <div className={styles.gridUnified}>
                  <div
                    className={`${styles.gridHeader} ${overlapOn ? styles.gridRowOverlap : ''}`}
                    style={{ gridTemplateColumns }}
                  >
                    <span className={`${styles.stickyCell} ${styles.indexSticky}`}>
                      {indexMeta.fieldCaption}
                    </span>
                    {dataColumns.map((col) => (
                      <span key={col.fieldName}>{col.fieldCaption}</span>
                    ))}
                  </div>
                  <div className={styles.pagedBody}>
                    {(overlapOn && viewMode === 'virtual' && rows.length > 400
                      ? rows.slice(0, 400)
                      : rows
                    ).map((row, i) => {
                      const idx =
                        viewMode === 'paged' ? (page - 1) * pageSize + i : i;
                      return renderRow(row, idx);
                    })}
                  </div>
                </div>
              )}

              {viewMode === 'paged' && (
                <div className={styles.pager}>
                  <button
                    type="button"
                    className={styles.demoToggle}
                    disabled={page <= 1}
                    onClick={async () => {
                      if (!grid) return;
                      await grid.session.dispatchViewIntent({
                        type: 'CHANGE_PAGE',
                        page: page - 1,
                      });
                      pushLog(`CHANGE_PAGE ${page - 1}`);
                    }}
                  >
                    Prev
                  </button>
                  <span className={styles.demoCardLead} style={{ margin: 0 }}>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className={styles.demoToggle}
                    disabled={page >= totalPages}
                    onClick={async () => {
                      if (!grid) return;
                      await grid.session.dispatchViewIntent({
                        type: 'CHANGE_PAGE',
                        page: page + 1,
                      });
                      pushLog(`CHANGE_PAGE ${page + 1}`);
                    }}
                  >
                    Next
                  </button>
                  <select
                    className={styles.demoSelect}
                    value={pageSize}
                    onChange={async (e) => {
                      if (!grid) return;
                      const size = Number(e.target.value);
                      await grid.session.dispatchViewIntent({
                        type: 'CHANGE_PAGE_SIZE',
                        pageSize: size,
                      });
                      pushLog(`CHANGE_PAGE_SIZE ${size}`);
                    }}
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <p className={styles.demoCardLead}>Booting…</p>
          )}
        </section>

        <section className={styles.demoCard}>
          <h2 className={styles.demoCardTitle}>History (session)</h2>
          <pre className={styles.demoLog}>
            {history.length === 0 ? '// no events yet' : history.join('\n')}
          </pre>
        </section>

        <section className={styles.demoCard}>
          <div className={`${styles.demoToolbar} ${styles.demoToolbarBetween}`}>
            <h2 className={styles.demoCardTitle} style={{ margin: 0 }}>
              Event Log
            </h2>
            <button type="button" className={styles.demoToggle} onClick={() => setLogs([])}>
              Clear
            </button>
          </div>
          <pre className={styles.demoLog}>
            {logs.length === 0
              ? '// no logs yet'
              : logs.map((l) => `[${l.at}] ${l.message}`).join('\n')}
          </pre>
        </section>

        <footer className={styles.footer}>
          <span>
            <code>npm run dev</code> = playground · report:{' '}
            <code>docs/demo-playground-report.md</code>
          </span>
          <span>Published APIs + demo chrome</span>
        </footer>
      </div>
    </div>
  );
}
