"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import type { RemoteApi } from '../../application/ports/RemoteApi';
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
};

const ERPTableHostContext = createContext<ERPTableHostValue>({
  locale: 'fa',
  direction: 'rtl',
});

export function ERPTableHostProvider({
  children,
  locale = 'fa',
  direction,
  remoteApi,
  messages,
  onToast,
}: ERPTableHostValue & { children: ReactNode }) {
  const value = useMemo<ERPTableHostValue>(
    () => ({
      locale,
      direction: direction ?? (locale === 'fa' ? 'rtl' : 'ltr'),
      remoteApi,
      messages,
      onToast,
    }),
    [locale, direction, remoteApi, messages, onToast],
  );

  return (
    <ERPTableHostContext.Provider value={value}>
      {children}
    </ERPTableHostContext.Provider>
  );
}

export function useERPTableHost(): ERPTableHostValue {
  return useContext(ERPTableHostContext);
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
