"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';

import type { RemoteApi } from '../../application/ports/RemoteApi';
import type { CellComponentMap } from '../cellRenderer/cellRegistry';
import {
  GridTheme,
  rememberThemeVars,
  themeErp,
  themeToStyle,
} from '../theme';
import {
  type ERPTableLocale,
  type ERPTableMessages,
  translate,
} from './messages';

export type ERPTableToastKind = 'success' | 'error';

export type ERPTableHostValue = {
  locale: ERPTableLocale;
  direction: 'rtl' | 'ltr';
  remoteApi?: RemoteApi;
  messages?: Partial<ERPTableMessages>;
  onToast?: (kind: ERPTableToastKind, message: string, detail?: unknown) => void;
  theme?: GridTheme;
  themeToggle?: boolean;
  themeLocked?: boolean;
  onToggleTheme?: () => void;
  components?: CellComponentMap;
};

const ERPTableHostContext = createContext<ERPTableHostValue>({
  locale: 'fa',
  direction: 'rtl',
  theme: themeErp,
  themeToggle: true,
  themeLocked: false,
});

export function ERPTableHostProvider({
  children,
  locale = 'fa',
  direction,
  remoteApi,
  messages,
  onToast,
  theme = themeErp,
  themeToggle = true,
  themeLocked = false,
  onToggleTheme,
  components,
}: ERPTableHostValue & { children: ReactNode }) {
  const value = useMemo<ERPTableHostValue>(
    () => ({
      locale,
      direction: direction ?? (locale === 'fa' ? 'rtl' : 'ltr'),
      remoteApi,
      messages,
      onToast,
      theme,
      themeToggle,
      themeLocked,
      onToggleTheme,
      components,
    }),
    [locale, direction, remoteApi, messages, onToast, theme, themeToggle, themeLocked, onToggleTheme, components],
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
  return (key: string) => translate(key, locale, messages);
}

export function useLocale(): ERPTableLocale {
  return useERPTableHost().locale;
}

export function useDirection(): 'rtl' | 'ltr' {
  return useERPTableHost().direction;
}
