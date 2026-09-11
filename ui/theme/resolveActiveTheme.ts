import {
  GridTheme,
  type ThemeParams,
  themeErp,
  themeErpDark,
} from './GridTheme';

export function themeParamsEqual(a: ThemeParams, b: ThemeParams): boolean {
  return (
    a.backgroundColor === b.backgroundColor &&
    a.foregroundColor === b.foregroundColor &&
    a.accentColor === b.accentColor &&
    a.headerBackgroundColor === b.headerBackgroundColor &&
    a.rowStripeColor === b.rowStripeColor &&
    a.rowSelectedColor === b.rowSelectedColor &&
    a.borderColor === b.borderColor &&
    a.dangerColor === b.dangerColor &&
    a.searchMatchColor === b.searchMatchColor &&
    a.fontFamily === b.fontFamily &&
    a.rowHeight === b.rowHeight &&
    a.cellFontSize === b.cellFontSize &&
    a.borderRadius === b.borderRadius
  );
}

export function isStockLightTheme(theme: GridTheme): boolean {
  return themeParamsEqual(theme.params, themeErp.params);
}

export function isStockDarkTheme(theme: GridTheme): boolean {
  return themeParamsEqual(theme.params, themeErpDark.params);
}

/** Built-in light/dark. Any `withParams` change locks the product toggle. */
export function isStockTheme(theme: GridTheme): boolean {
  return isStockLightTheme(theme) || isStockDarkTheme(theme);
}

export function resolveActiveTheme(input: {
  requested?: GridTheme;
  preferDark: boolean;
}): { theme: GridTheme; locked: boolean } {
  const requested = input.requested ?? themeErp;
  const locked = !isStockTheme(requested);
  if (locked) return { theme: requested, locked: true };
  return {
    theme: input.preferDark ? themeErpDark : themeErp,
    locked: false,
  };
}
