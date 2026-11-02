"use client";
import React, {
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { CreateERPTableConfig } from '../bootstrap/type';
import { UITableController } from '../infrastructure/ui/UITableController';
import type { GridApi } from '../infrastructure/ui/createGridApi';
import {
  ERPTableHostProvider,
  resolveDirection,
  useMediaQuery,
  type ERPTableLocale,
  type ERPTableMessages,
  type ERPTableToastKind,
  type NumberingSystem,
  type DateAdapter,
  type UseDependOnHook,
} from './host';
import type { ColumnMenuItemsConfig } from '../engine/dataOps/columnMenu';
import { DesktopTable } from './desktop/DesktopTable';
import type { ColumnMenuActionEvent } from './desktop/ColumnMenuPopover';
import { MobileTable } from './mobile/MobileTable';
import {
  GridTheme,
  isStockDarkTheme,
  resolveActiveTheme,
  themeDefault,
  themeToStyle,
} from './theme';
import { IMultiSelectConfig } from './type';
import type { CellComponentMap } from './cellRenderer/cellRegistry';
import type { FilterComponentMap } from './filters';
import type { GridOverlayComponent } from './overlays';
import {
  isGridShortcutKey,
  resolveGridKeyScope,
  shouldSkipGridNavigation,
} from './keyboard/skipGridNavigation';
import { useGrid } from './useERPTable';
import { useGridHostEvents } from './host/useGridHostEvents';
import { assignRef } from './host/assignRef';
import type {
  GridReadyEvent,
} from './host/bindGridHostEvents';
import type {
  CellFocusedEvent,
  CellValueChangedEvent,
  RowDataUpdatedEvent,
  RowValueChangedEvent,
  SelectionChangedEvent,
} from '../application/events/hostGridEvents';
import type { ProcessCellForClipboardParams } from '../engine/selection/clipboardCopy';
import type {
  ClipboardCopyEvent,
  ClipboardPasteEvent,
} from '../infrastructure/ui/gridClipboard';

export type {
  CellFocusedEvent,
  CellValueChangedEvent,
  RowDataUpdatedEvent,
  RowValueChangedEvent,
  SelectionChangedEvent,
} from '../application/events/hostGridEvents';
export type {
  ClipboardCopyEvent,
  ClipboardPasteEvent,
} from '../infrastructure/ui/gridClipboard';
export type { ProcessCellForClipboardParams } from '../engine/selection/clipboardCopy';
export type { GridReadyEvent } from './host/bindGridHostEvents';
export type {
  GridApi,
  GridColumnState,
  GridRowNode,
  StartEditingCellParams,
} from '../infrastructure/ui/createGridApi';

export interface DataGridProps<TRow = unknown> extends CreateERPTableConfig<TRow> {
  /**
   * Filled when the grid hydrates; cleared on unmount.
   * Prefer this over `onReady` (PR-86).
   */
  apiRef?: Ref<GridApi<TRow> | null>;
  /**
   * @deprecated Prefer {@link DataGridProps.apiRef} / `onGridReady` (PR-86).
   * Still receives `UITableController` for one version so existing hosts compile.
   */
  onReady?: (controller: UITableController) => void;
  /** Fires once when the grid has hydrated. Same moment as `onReady` (PR-85). */
  onGridReady?: (event: GridReadyEvent<NoInfer<TRow>>) => void;
  /** One call per `CELL_CHANGED` catalog event. */
  onCellValueChanged?: (event: CellValueChangedEvent<NoInfer<TRow>>) => void;
  /** Same `CELL_CHANGED` event, with the host row (`data`). */
  onRowValueChanged?: (event: RowValueChangedEvent<NoInfer<TRow>>) => void;
  /** Row add/delete/reorder catalog events, or later `rowData` prop updates. */
  onRowDataUpdated?: (event: RowDataUpdatedEvent<NoInfer<TRow>>) => void;
  /** View-store selection (`selectedRows`), not a second event bus. */
  onSelectionChanged?: (event: SelectionChangedEvent<NoInfer<TRow>>) => void;
  /** View-store active cell. */
  onCellFocused?: (event: CellFocusedEvent) => void;
  tableTitle?: ReactNode;
  header?: ReactNode;
  footer?: boolean | ReactNode;
  /**
   * When `footer={true}`, optional multi-row aggregates (PR-119).
   * Each row can override `aggFunc` (e.g. sum + avg).
   */
  footerRows?: readonly import('./desktop/ERPTableFooter').FooterRowDef[];
  activeCollection?: string;
  tableHeight?: number;
  /** When omitted, the choose-from-list button and modal are not rendered (D11). */
  multiSelectConfig?: IMultiSelectConfig;
  moreDetailComponent?: React.ComponentType<{data: unknown}>;
  /**
   * Desktop virtual scroll. Default **on** when a session is present (PR-97 / D17).
   * Pass `virtualization={false}` for classic pagination chrome.
   */
  virtualization?: boolean;
  locale?: ERPTableLocale;
  /**
   * Writing direction. Default derived from `locale` (`fa`/`ar` → rtl, `en` → ltr).
   * Pass explicitly to override (PR-127).
   */
  direction?: 'rtl' | 'ltr';
  /**
   * Intl digit system (PR-127). Default from locale meta
   * (`fa` → arabext, `ar` → arab, `en` → latn).
   */
  numberingSystem?: NumberingSystem;
  /**
   * Calendar port (PR-128 / D21). Default jalali for `locale="fa"`, else gregorian.
   */
  dateAdapter?: DateAdapter;
  messages?: Partial<ERPTableMessages>;
  onToast?: (kind: ERPTableToastKind, message: string, detail?: unknown) => void;
  /** Typed CSS variables on the table root. Default `themeDefault`. */
  theme?: GridTheme;
  /**
   * Show the light/dark button in product chrome. Default true.
   * Hidden when `theme` is a custom (non-stock) GridTheme.
   */
  themeToggle?: boolean;
  /**
   * Replace built-in FieldType editors (PR-55). Keys are FieldType or a custom
   * string. Column `render` still wins. Omit = CellRenderer switch fallback.
   */
  components?: CellComponentMap;
  /**
   * Custom column filter UIs (PR-95). Keys match `ColumnDef.filter` string /
   * `{ type }`. Built-in names (`text`/`number`/…) stay on the default popover.
   */
  filterComponents?: FilterComponentMap;
  /**
   * Show a floating filter row under the header (PR-94).
   * Column menu filters work without this.
   */
  floatingFilter?: boolean;
  /**
   * Full-grid loading overlay (PR-103). Independent of hydrate `ready`.
   */
  loading?: boolean;
  /** Replace the default loading overlay (PR-103). */
  loadingOverlayComponent?: GridOverlayComponent;
  /** Replace the default empty overlay (PR-103). */
  noRowsOverlayComponent?: GridOverlayComponent;
  /**
   * Copy formatted display strings instead of raw values (PR-106).
   * Default false.
   */
  copyFormattedValue?: boolean;
  /** Include column headers in clipboard TSV/HTML (PR-106). Default false. */
  copyHeadersToClipboard?: boolean;
  /**
   * Convert eastern digits to ASCII in clipboard text (PR-106).
   * Default true.
   */
  copyDigitsAsLatin?: boolean;
  /** Override per-cell clipboard text (PR-106). */
  processCellForClipboard?: (
    params: ProcessCellForClipboardParams,
  ) => string;
  /**
   * Fires before writing to the system clipboard (PR-106).
   * Return `false` to cancel the default write.
   */
  onClipboardCopy?: (event: ClipboardCopyEvent) => boolean | void;
  /**
   * When true (default), paste past the last row adds rows (PR-107).
   */
  pasteAddsRows?: boolean;
  /** Fires before paste; return false to cancel (PR-107). */
  onClipboardPaste?: (event: ClipboardPasteEvent) => boolean | void;
  /**
   * Column header ⋮ menu items (PR-114). Pass a function to trim/reorder defaults
   * or append `{ name, label }` custom entries (handle via `onColumnMenuAction`).
   */
  columnMenuItems?: ColumnMenuItemsConfig;
  /** Fires for custom column menu items (PR-114). */
  onColumnMenuAction?: (event: ColumnMenuActionEvent) => void;
  /**
   * Host hook resolving `dependOn` values of remote lists (see
   * `ERPTableHostProvider`). When omitted, an outer `ERPTableHostProvider`'s
   * hook is used, else the static item values.
   */
  useDependOn?: UseDependOnHook;
  /**
   * Rows stuck under the header (PR-116). Display-only; not virtualized,
   * sorted, filtered, or selected with body rows.
   */
  pinnedTopRowData?: readonly NoInfer<TRow>[];
  /**
   * Rows stuck above the footer (PR-116). Display-only; not virtualized.
   */
  pinnedBottomRowData?: readonly NoInfer<TRow>[];
}

/** @deprecated Use {@link DataGridProps}. Removed in 1.0.0. */
export type ERPTableProps<TRow = unknown> = DataGridProps<TRow>;

export function DataGrid<TRow = unknown>(props: DataGridProps<TRow>) {
  const {
    apiRef,
    onReady,
    onGridReady,
    onCellValueChanged,
    onRowValueChanged,
    onRowDataUpdated,
    onSelectionChanged,
    onCellFocused,
    tableTitle,
    header,
    footer,
    footerRows,
    tableHeight,
    multiSelectConfig,
    moreDetailComponent,
    virtualization,
    remoteApi,
    locale = 'fa',
    direction,
    numberingSystem,
    dateAdapter,
    messages,
    onToast,
    theme: themeProp,
    themeToggle = true,
    components,
    filterComponents,
    rowData,
    floatingFilter = false,
    loading = false,
    loadingOverlayComponent,
    noRowsOverlayComponent,
    copyFormattedValue,
    copyHeadersToClipboard,
    copyDigitsAsLatin,
    processCellForClipboard,
    onClipboardCopy,
    pasteAddsRows,
    onClipboardPaste,
    columnMenuItems,
    onColumnMenuAction,
    useDependOn,
    pinnedTopRowData,
    pinnedBottomRowData,
  } = props;

  /** Grid root — scopes the window key listener to this grid. */
  const rootRef = useRef<HTMLDivElement>(null);
  /** Last focus / pointer event seen inside the grid's React tree (portals included). */
  const insideEventRef = useRef<Event | null>(null);
  const markInsideEvent = useCallback((e: React.SyntheticEvent) => {
    insideEventRef.current = e.nativeEvent;
  }, []);

  const requestedTheme = themeProp ?? themeDefault;
  const requestedKey = JSON.stringify(requestedTheme.params);
  const [preferDark, setPreferDark] = useState(() =>
    isStockDarkTheme(requestedTheme),
  );

  const { theme: resolvedTheme, locked: themeLocked } = useMemo(
    () =>
      resolveActiveTheme({
        requested: requestedTheme,
        preferDark,
      }),
    [requestedTheme, preferDark],
  );

  useEffect(() => {
    if (themeLocked) return;
    setPreferDark(isStockDarkTheme(requestedTheme));
  }, [requestedKey, themeLocked, requestedTheme]);

  const onToggleTheme = useCallback(() => {
    setPreferDark((value) => !value);
  }, []);

  // Every grid option (`persistence`, `cellEditCommit`, `enterNavigation`,
  // `quickFilterText`, `rowModelType`, `eventStoreName`, …) reaches createGrid;
  // the UI-only props are ignored there. Page size follows the rendered row
  // height of the theme.
  const result = useGrid<TRow>({
    ...props,
    rowHeight: resolvedTheme.params.rowHeight,
  });

  useEffect(() => {
    if (!result.ready) return;
    result.controller.configureClipboard({
      copyFormattedValue,
      copyHeadersToClipboard,
      copyDigitsAsLatin,
      processCellForClipboard,
      onClipboardCopy,
      pasteAddsRows,
      onClipboardPaste,
    });
  }, [
    result.ready,
    result.ready ? result.controller : null,
    copyFormattedValue,
    copyHeadersToClipboard,
    copyDigitsAsLatin,
    processCellForClipboard,
    onClipboardCopy,
    pasteAddsRows,
    onClipboardPaste,
  ]);

  useEffect(() => {
    if (!result.ready) return;
    const {controller} = result;

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button");
      if (button) {
        const {pageid, id} = button.dataset;
        if (result.tableKey === id || result.tableKey === pageid) {
          controller.dispose();
        }
      }
    };

    const handler = (e: KeyboardEvent) => {
      // The listener is window-level (Select popups, legacy chords): keys
      // typed in page forms, the toolbar, header filters or another grid are
      // never taken — only the legacy global chords are.
      const scope = resolveGridKeyScope(e.target, rootRef.current);
      if (scope === 'other-grid') return;
      const shortcut = isGridShortcutKey(e);
      if (scope === 'outside' && !shortcut) return;
      // Table Alt/Ctrl shortcuts win over Select; preventDefault must run
      // synchronously — the async dispatch below is too late.
      if (shortcut) {
        e.preventDefault();
        e.stopPropagation();
      } else if (shouldSkipGridNavigation(e.target, e.code)) {
        return;
      }
      const activeRow = controller.getActiveRow();
      const activeCell = controller.getActiveCell();
      void controller.dispatch({
        type: "KEY_DOWN",
        event: e,
        ctx: {
          activeRowId: activeRow,
          tableKey: result.tableKey,
          activeColumnId: activeCell?.columnId ?? null,
        },
      });
    };

    window.addEventListener("keydown", handler, true);
    window.addEventListener("click", clickHandler, true);
    return () => {
      window.removeEventListener("click", clickHandler, true);
      window.removeEventListener("keydown", handler, true);
    };
  }, [result.ready, result]);

  // `stopEditingWhenCellsLoseFocus`: a focus / pointer-down outside the grid
  // ends a deferred edit. React events bubble through portals, so Select
  // popups, date pickers and menus rendered by the grid count as inside.
  const readyController = result.ready ? result.controller : null;
  useEffect(() => {
    if (!readyController || typeof document === 'undefined') return;
    const onDocument = (event: Event) => {
      window.setTimeout(() => {
        if (insideEventRef.current === event) return;
        void readyController.leaveGridFocus();
      }, 0);
    };
    document.addEventListener('focusin', onDocument, true);
    document.addEventListener('pointerdown', onDocument, true);
    return () => {
      document.removeEventListener('focusin', onDocument, true);
      document.removeEventListener('pointerdown', onDocument, true);
    };
  }, [readyController]);

  useGridHostEvents({
    ready: result.ready,
    controller: result.ready ? result.controller : null,
    eventStore: result.ready ? result.eventStore : null,
    tableKey: result.ready ? result.tableKey : '',
    onCellValueChanged,
    onRowValueChanged,
    onRowDataUpdated,
    onSelectionChanged,
    onCellFocused,
  });

  const rowDataPrimedRef = useRef(false);
  useEffect(() => {
    if (!result.ready) {
      rowDataPrimedRef.current = false;
      return;
    }
    if (rowData === undefined) return;
    if (!rowDataPrimedRef.current) {
      rowDataPrimedRef.current = true;
      return;
    }
    onRowDataUpdated?.({
      rowData: [...rowData],
      source: 'rowData',
    });
  }, [result.ready, rowData, onRowDataUpdated]);

  useEffect(() => {
    if (!result.ready) return;
    const api = result.api;
    assignRef(apiRef, api);
    onReady?.(result.controller);
    onGridReady?.({ api });
    return () => assignRef(apiRef, null);
  }, [result, apiRef, onReady, onGridReady]);

  const {match: viewportMatch} = useMediaQuery("XLUP");
  const isMobile = viewportMatch === false;

  if (!result.ready) return null;

  const sharedProps = {
    controller: result.controller,
    tableKey: result.tableKey,
    tableTitle,
    header,
    footer,
    multiSelectConfig,
    pluginHost: result.pluginHost,
    loading,
    loadingOverlayComponent,
    noRowsOverlayComponent,
  };

  const table = isMobile ? (
    <MobileTable {...sharedProps} />
  ) : (
    <DesktopTable
      {...sharedProps}
      store={result.store}
      tableHeight={tableHeight}
      moreDetailComponent={moreDetailComponent}
      ready={result.ready}
      virtualization={virtualization}
      session={result.session}
      floatingFilter={floatingFilter}
      footerRows={footerRows}
      pinnedTopRowData={pinnedTopRowData}
      pinnedBottomRowData={pinnedBottomRowData}
    />
  );

  const dir = resolveDirection(locale, direction);
  const themeMode = isStockDarkTheme(resolvedTheme) ? 'dark' : 'light';

  return (
    <ERPTableHostProvider
      locale={locale}
      direction={dir}
      numberingSystem={numberingSystem}
      dateAdapter={dateAdapter}
      messages={messages}
      onToast={onToast}
      remoteApi={remoteApi ?? result.controller.getRemoteApi()}
      theme={resolvedTheme}
      themeToggle={themeToggle}
      themeLocked={themeLocked}
      onToggleTheme={themeLocked ? undefined : onToggleTheme}
      components={components}
      filterComponents={filterComponents}
      columnMenuItems={columnMenuItems}
      onColumnMenuAction={onColumnMenuAction}
      useDependOn={useDependOn}
    >
      <div
        ref={rootRef}
        className="pdg-grid erp-table"
        dir={dir}
        onFocusCapture={markInsideEvent}
        onPointerDownCapture={markInsideEvent}
        data-pdg-grid
        data-erp-table
        data-erp-theme={themeMode}
        data-erp-theme-locked={themeLocked ? 'true' : 'false'}
        style={themeToStyle(resolvedTheme)}
      >
        {table}
      </div>
    </ERPTableHostProvider>
  );
}

/** @deprecated Use {@link DataGrid}. Removed in 1.0.0. */
export const ERPTable = DataGrid;
