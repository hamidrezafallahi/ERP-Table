export type ThemeParams = {
  backgroundColor: string;
  foregroundColor: string;
  accentColor: string;
  headerBackgroundColor: string;
  rowStripeColor: string;
  rowSelectedColor: string;
  borderColor: string;
  dangerColor: string;
  searchMatchColor: string;
  fontFamily: string;
  rowHeight: number;
  cellFontSize: number;
  borderRadius: string;
};

export type ThemeCssVars = Record<string, string>;

/** `--erp-*` mirrors `--pdg-*` for one version (PR-87 / D13). */
function aliasErpTokens(vars: ThemeCssVars): ThemeCssVars {
  const out: ThemeCssVars = {};
  for (const [key, value] of Object.entries(vars)) {
    if (key.startsWith('--pdg-')) {
      out[`--erp-${key.slice('--pdg-'.length)}`] = value;
    }
  }
  return out;
}

export class GridTheme {
  constructor(
    readonly params: ThemeParams,
    readonly extraCssVars: ThemeCssVars = {},
  ) {}

  withParams(partial: Partial<ThemeParams>): GridTheme {
    return new GridTheme({ ...this.params, ...partial }, this.extraCssVars);
  }

  withExtraCssVars(extra: ThemeCssVars): GridTheme {
    return new GridTheme(this.params, { ...this.extraCssVars, ...extra });
  }

  toCssVars(): ThemeCssVars {
    const p = this.params;
    const roles: ThemeCssVars = {
      '--pdg-bg': p.backgroundColor,
      '--pdg-fg': p.foregroundColor,
      '--pdg-accent': p.accentColor,
      '--pdg-header-bg': p.headerBackgroundColor,
      '--pdg-row-stripe': p.rowStripeColor,
      '--pdg-row-selected': p.rowSelectedColor,
      '--pdg-border': p.borderColor,
      '--pdg-danger': p.dangerColor,
      '--pdg-search-match': p.searchMatchColor,
      '--pdg-font': p.fontFamily,
      '--pdg-row-height': `${p.rowHeight}px`,
      '--pdg-font-size': `${p.cellFontSize}px`,
      '--pdg-radius': p.borderRadius,
    };
    return {
      ...roles,
      ...aliasErpTokens(roles),
      ...this.extraCssVars,
      ...aliasErpTokens(this.extraCssVars),
    };
  }
}

/** Default grid chrome — same computed colors as the CSS palette aliases. */
export const themeDefault = new GridTheme({
  backgroundColor: '#fff',
  foregroundColor: '#292929',
  accentColor: '#0658b0',
  headerBackgroundColor: '#f4f4f4',
  rowStripeColor: '#ddecfd',
  rowSelectedColor: '#dbeafe',
  borderColor: '#ececec',
  dangerColor: '#dc2626',
  searchMatchColor: '#facc15',
  fontFamily: 'IRANSans, Tahoma, sans-serif',
  rowHeight: 40,
  cellFontSize: 12,
  borderRadius: '0.25rem',
});

/** @deprecated Use {@link themeDefault}. Removed in 1.0.0. */
export const themeErp = themeDefault;

/** Dark chrome. Palette extras keep leftover gray utilities readable. */
const DARK_PALETTE_VARS: ThemeCssVars = {
  '--pdg-main-white': '#171717',
  '--pdg-main-black': '#f4f4f4',
  '--pdg-gray-3': '#262626',
  '--pdg-gray-5': '#404040',
  '--pdg-gray-6': '#525252',
  '--pdg-gray-7': '#a3a3a3',
  '--pdg-gray-8': '#d4d4d4',
  '--pdg-gray-85': '#d4d4d4',
  '--pdg-gray-9': '#e5e5e5',
  '--pdg-gray-10': '#f5f5f5',
  '--pdg-gray-11': '#fafafa',
  '--pdg-black-6': '#f4f4f4',
  '--pdg-blue-6': '#60a5fa',
  '--pdg-blue-11': '#1e3a5f',
  '--pdg-blue-100': '#1e3a8a',
  '--pdg-red-100': '#7f1d1d',
  '--pdg-red-300': '#fca5a5',
  '--pdg-red-600': '#f87171',
  '--pdg-yellow-200': '#854d0e',
  '--pdg-yellow-400': '#eab308',
  '--pdg-zinc-200': '#3f3f46',
  '--pdg-neutral-500': '#a3a3a3',
  '--pdg-gray-100': '#27272a',
  '--pdg-scrollbar': '#525252',
  '--pdg-overlay': 'rgba(0, 0, 0, 0.55)',
};

export const themeDark = themeDefault
  .withParams({
    backgroundColor: '#171717',
    foregroundColor: '#f4f4f4',
    accentColor: '#60a5fa',
    headerBackgroundColor: '#262626',
    rowStripeColor: '#1e3a5f',
    rowSelectedColor: '#1e3a8a',
    borderColor: '#404040',
    dangerColor: '#f87171',
    searchMatchColor: '#eab308',
  })
  .withExtraCssVars(DARK_PALETTE_VARS);

/** @deprecated Use {@link themeDark}. Removed in 1.0.0. */
export const themeErpDark = themeDark;
