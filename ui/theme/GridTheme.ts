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
    return {
      '--erp-bg': p.backgroundColor,
      '--erp-fg': p.foregroundColor,
      '--erp-accent': p.accentColor,
      '--erp-header-bg': p.headerBackgroundColor,
      '--erp-row-stripe': p.rowStripeColor,
      '--erp-row-selected': p.rowSelectedColor,
      '--erp-border': p.borderColor,
      '--erp-danger': p.dangerColor,
      '--erp-search-match': p.searchMatchColor,
      '--erp-font': p.fontFamily,
      '--erp-row-height': `${p.rowHeight}px`,
      '--erp-font-size': `${p.cellFontSize}px`,
      '--erp-radius': p.borderRadius,
      ...this.extraCssVars,
    };
  }
}

/** Default ERP chrome — same computed colors as the CSS palette aliases. */
export const themeErp = new GridTheme({
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

/** Dark ERP chrome. Palette extras keep leftover `--erp-gray-*` utilities readable. */
const DARK_PALETTE_VARS: ThemeCssVars = {
  '--erp-main-white': '#171717',
  '--erp-main-black': '#f4f4f4',
  '--erp-gray-3': '#262626',
  '--erp-gray-5': '#404040',
  '--erp-gray-6': '#525252',
  '--erp-gray-7': '#a3a3a3',
  '--erp-gray-8': '#d4d4d4',
  '--erp-gray-85': '#d4d4d4',
  '--erp-gray-9': '#e5e5e5',
  '--erp-gray-10': '#f5f5f5',
  '--erp-gray-11': '#fafafa',
  '--erp-black-6': '#f4f4f4',
  '--erp-blue-6': '#60a5fa',
  '--erp-blue-11': '#1e3a5f',
  '--erp-blue-100': '#1e3a8a',
  '--erp-red-100': '#7f1d1d',
  '--erp-red-300': '#fca5a5',
  '--erp-red-600': '#f87171',
  '--erp-yellow-200': '#854d0e',
  '--erp-yellow-400': '#eab308',
  '--erp-zinc-200': '#3f3f46',
  '--erp-neutral-500': '#a3a3a3',
  '--erp-gray-100': '#27272a',
  '--erp-scrollbar': '#525252',
  '--erp-overlay': 'rgba(0, 0, 0, 0.55)',
};

export const themeErpDark = themeErp
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
