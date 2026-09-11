"use client";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { injectERPTableStyles } from './styles/injectStyles';
import { CreateERPTableConfig } from '../bootstrap/type';
import { UITableController } from '../infrastructure/ui/UITableController';
import {
  ERPTableHostProvider,
  useMediaQuery,
  type ERPTableLocale,
  type ERPTableMessages,
  type ERPTableToastKind,
} from './host';
import { DesktopTable } from './desktop/DesktopTable';
import { MobileTable } from './mobile/MobileTable';
import {
  GridTheme,
  isStockDarkTheme,
  resolveActiveTheme,
  themeErp,
  themeToStyle,
} from './theme';
import { IMultiSelectConfig } from './type';
import type { CellComponentMap } from './cellRenderer/cellRegistry';
import { shouldSkipGridNavigation } from './keyboard/skipGridNavigation';
import { useERPTable } from './useERPTable';

export interface ERPTableProps extends CreateERPTableConfig {
  onReady?: (controller: UITableController) => void;
  tableTitle?: ReactNode;
  header?: ReactNode;
  footer?: boolean | ReactNode;
  activeCollection?: string;
  tableHeight?: number;
  /** When omitted, the choose-from-list button and modal are not rendered (D11). */
  multiSelectConfig?: IMultiSelectConfig;
  moreDetailComponent?: React.ComponentType<{data: unknown}>;
  /**
   * Desktop virtual scroll. Default **false** to match ERP pagination.
   * Pass true to enable GridSession virtualization.
   */
  virtualization?: boolean;
  locale?: ERPTableLocale;
  direction?: 'rtl' | 'ltr';
  messages?: Partial<ERPTableMessages>;
  onToast?: (kind: ERPTableToastKind, message: string, detail?: unknown) => void;
  /** Typed CSS variables on the table root. Default `themeErp`. */
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
}

export function ERPTable(props: ERPTableProps) {
  injectERPTableStyles();
  const {
    columns,
    rowAccess,
    rows,
    actor,
    store,
    tableKey,
    onReady,
    tableTitle,
    header,
    footer,
    tableHeight,
    activeCollection,
    recordPerPage,
    multiSelectConfig,
    moreDetailComponent,
    virtualization,
    remoteApi,
    locale = 'fa',
    direction,
    messages,
    onToast,
    theme: themeProp,
    themeToggle = true,
    components,
    plugins,
  } = props;

  const requestedTheme = themeProp ?? themeErp;
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

  const result = useERPTable({
    store,
    tableKey,
    activeCollection,
    columns,
    rows,
    actor,
    rowAccess,
    tableHeight,
    recordPerPage,
    rowHeight: resolvedTheme.params.rowHeight,
    remoteApi,
    plugins,
  });

  useEffect(() => {
    if (!result.ready) return;
    const {controller} = result;

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button");
      if (button) {
        const {pageid, id} = button.dataset;
        if (tableKey === id || tableKey === pageid) {
          controller.dispose();
        }
      }
    };

    const handler = (e: KeyboardEvent) => {
      if (shouldSkipGridNavigation(e.target, e.code)) {
        return;
      }
      const activeRow = controller.getActiveRow();
      const activeCell = controller.getActiveCell();
      controller.dispatch({
        type: "KEY_DOWN",
        event: e,
        ctx: {
          activeRowId: activeRow,
          tableKey,
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
  }, [result.ready, tableKey, result]);

  useEffect(() => {
    if (result.ready) {
      onReady?.(result.controller);
    }
  }, [result, onReady]);

  const {match: viewportMatch} = useMediaQuery("XLUP");
  const isMobile = viewportMatch === false;

  if (!result.ready) return null;

  const sharedProps = {
    controller: result.controller,
    tableKey,
    tableTitle,
    header,
    footer,
    multiSelectConfig,
    pluginHost: result.pluginHost,
  };

  const table = isMobile ? (
    <MobileTable {...sharedProps} />
  ) : (
    <DesktopTable
      {...sharedProps}
      store={store}
      tableHeight={tableHeight}
      moreDetailComponent={moreDetailComponent}
      ready={result.ready}
      virtualization={virtualization}
      session={result.session}
    />
  );

  const dir = direction ?? (locale === 'fa' ? 'rtl' : 'ltr');
  const themeMode = isStockDarkTheme(resolvedTheme) ? 'dark' : 'light';

  return (
    <ERPTableHostProvider
      locale={locale}
      direction={dir}
      messages={messages}
      onToast={onToast}
      remoteApi={remoteApi ?? result.controller.getRemoteApi()}
      theme={resolvedTheme}
      themeToggle={themeToggle}
      themeLocked={themeLocked}
      onToggleTheme={themeLocked ? undefined : onToggleTheme}
      components={components}
    >
      <div
        className="erp-table"
        dir={dir}
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
