import type { CSSProperties } from 'react';

import type { GridTheme, ThemeCssVars } from './GridTheme';
import { themeErp } from './GridTheme';

let lastVars: ThemeCssVars = themeErp.toCssVars();

export function rememberThemeVars(vars: ThemeCssVars): void {
  lastVars = vars;
}

export function getRememberedThemeVars(): ThemeCssVars {
  return lastVars;
}

export function themeToStyle(
  theme: GridTheme,
  extra?: CSSProperties,
): CSSProperties {
  return { ...theme.toCssVars(), ...extra } as CSSProperties;
}

/** Copy last (or given) theme vars onto an imperative DOM node (toasts). */
export function assignThemeVars(
  el: HTMLElement,
  vars: ThemeCssVars = lastVars,
): void {
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value);
  }
}
