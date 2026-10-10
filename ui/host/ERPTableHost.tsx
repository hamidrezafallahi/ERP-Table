"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';

import type { DateAdapter } from '../../application/ports/DateAdapter';
import type { UseDependOnHook } from './dependOn';
import type { RemoteApi } from '../../application/ports/RemoteApi';
import type { ColumnMenuItemsConfig } from '../../engine/dataOps/columnMenu';
import {
  gregorianAdapter,
  jalaliAdapter,
} from '../../infrastructure/date';
import type { CellComponentMap } from '../cellRenderer/cellRegistry';
import type { ColumnMenuActionEvent } from '../desktop/ColumnMenuPopover';
import type { FilterComponentMap } from '../filters';
import {
  GridTheme,
  rememberThemeVars,
  themeErp,
  themeToStyle,
} from '../theme';
import {
  formatMessage,
  resolveDirection,
  type ERPTableLocale,
  type ERPTableMessages,
  type NumberingSystem,
  translate,
} from './messages';

export type ERPTableToastKind = 'success' | 'error';

export type ERPTableHostValue = {
  locale: ERPTableLocale;
  direction: 'rtl' | 'ltr';
  /** Intl digit system (PR-127). Default from locale meta. */
  numberingSystem?: NumberingSystem;
  /**
   * Calendar port (PR-128 / D21). Default: `jalaliAdapter` for `fa`,
   * otherwise `gregorianAdapter`.
   */
  dateAdapter?: DateAdapter;
  remoteApi?: RemoteApi;
  messages?: Partial<ERPTableMessages>;
  onToast?: (kind: ERPTableToastKind, message: string, detail?: unknown) => void;
  theme?: GridTheme;
  themeToggle?: boolean;
  themeLocked?: boolean;
  onToggleTheme?: () => void;
  components?: CellComponentMap;
  /** Custom column filter UIs (PR-95). Keys match `ColumnDef.filter`. */
  filterComponents?: FilterComponentMap;
  /** Column header menu items (PR-114). */
  columnMenuItems?: ColumnMenuItemsConfig;
  /** Custom column menu action handler (PR-114). */
  onColumnMenuAction?: (event: ColumnMenuActionEvent) => void;
  /**
   * Resolves `dependOn` values for remote lists (e.g. from the form that owns
   * the grid — Redux, React context, …). Default: static item values.
   */
  useDependOn?: UseDependOnHook;
};

function defaultDateAdapter(locale: ERPTableLocale): DateAdapter {
  return locale === 'fa' ? jalaliAdapter : gregorianAdapter;
}

const ERPTableHostContext = createContext<ERPTableHostValue>({
  locale: 'fa',
  direction: 'rtl',
  dateAdapter: jalaliAdapter,
  theme: themeErp,
  themeToggle: true,
  themeLocked: false,
});

export function ERPTableHostProvider({
  children,
  locale = 'fa',
  direction,
  numberingSystem,
  dateAdapter,
  remoteApi,
  messages,
  onToast,
  theme = themeErp,
  themeToggle = true,
  themeLocked = false,
  onToggleTheme,
  components,
  filterComponents,
  columnMenuItems,
  onColumnMenuAction,
  useDependOn,
}: ERPTableHostValue & { children: ReactNode }) {
  const value = useMemo<ERPTableHostValue>(
    () => ({
      locale,
      direction: resolveDirection(locale, direction),
      numberingSystem,
      dateAdapter: dateAdapter ?? defaultDateAdapter(locale),
      remoteApi,
      messages,
      onToast,
      theme,
      themeToggle,
      themeLocked,
      onToggleTheme,
      components,
      filterComponents,
      columnMenuItems,
      onColumnMenuAction,
      useDependOn,
    }),
    [
      locale,
      direction,
      numberingSystem,
      dateAdapter,
      remoteApi,
      messages,
      onToast,
      theme,
      themeToggle,
      themeLocked,
      onToggleTheme,
      components,
      filterComponents,
      columnMenuItems,
      onColumnMenuAction,
      useDependOn,
    ],
  );

  useEffect(() => {
    rememberThemeVars(theme.toCssVars());
  }, [theme]);

  return (
    <ERPTableHostContext.Provider value={value}>
      {children}
    </ERPTableHostContext.Provider>
  );
}

export function useERPTableHost(): ERPTableHostValue {
  return useContext(ERPTableHostContext);
}

export function useERPTableTheme(): GridTheme {
  return useERPTableHost().theme ?? themeErp;
}

/** Merge theme CSS vars into a portal node that mounts on `document.body`. */
export function useThemePortalStyle(extra?: CSSProperties): CSSProperties {
  const theme = useERPTableTheme();
  return themeToStyle(theme, extra);
}

export function useTranslations() {
  const { locale, messages } = useERPTableHost();
  return (key: string, vars?: Record<string, string | number>) => {
    const raw = translate(key, locale, messages);
    return vars ? formatMessage(raw, vars) : raw;
  };
}

export function useLocale(): ERPTableLocale {
  return useERPTableHost().locale;
}

export function useNumberingSystem(): NumberingSystem | undefined {
  return useERPTableHost().numberingSystem;
}

export function useDateAdapter(): DateAdapter {
  return useERPTableHost().dateAdapter ?? jalaliAdapter;
}

export function useDirection(): 'rtl' | 'ltr' {
  return useERPTableHost().direction;
}
