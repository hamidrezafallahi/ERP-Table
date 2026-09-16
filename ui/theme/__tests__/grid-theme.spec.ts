import { describe, expect, it } from 'vitest';
import {
  GridTheme,
  themeDark,
  themeDefault,
  themeErp,
  themeErpDark,
} from '../GridTheme';

describe('GridTheme', () => {
  it('withParams returns a new instance and does not mutate the original', () => {
    const next = themeErp.withParams({ accentColor: 'hotpink', rowHeight: 48 });
    expect(next).not.toBe(themeErp);
    expect(themeErp.params.accentColor).toBe('#0658b0');
    expect(themeErp.params.rowHeight).toBe(40);
    expect(next.params.accentColor).toBe('hotpink');
    expect(next.params.rowHeight).toBe(48);
    expect(next.params.fontFamily).toBe(themeErp.params.fontFamily);
  });

  it('themeErp / themeErpDark are deprecated aliases of themeDefault / themeDark', () => {
    expect(themeErp).toBe(themeDefault);
    expect(themeErpDark).toBe(themeDark);
  });

  it('toCssVars maps params to --pdg-* role tokens and --erp-* aliases', () => {
    const vars = themeErp.toCssVars();
    expect(vars['--pdg-bg']).toBe('#fff');
    expect(vars['--pdg-fg']).toBe('#292929');
    expect(vars['--pdg-accent']).toBe('#0658b0');
    expect(vars['--pdg-header-bg']).toBe('#f4f4f4');
    expect(vars['--pdg-row-stripe']).toBe('#ddecfd');
    expect(vars['--pdg-row-selected']).toBe('#dbeafe');
    expect(vars['--pdg-border']).toBe('#ececec');
    expect(vars['--pdg-danger']).toBe('#dc2626');
    expect(vars['--pdg-search-match']).toBe('#facc15');
    expect(vars['--pdg-font']).toBe('IRANSans, Tahoma, sans-serif');
    expect(vars['--pdg-row-height']).toBe('40px');
    expect(vars['--pdg-font-size']).toBe('12px');
    expect(vars['--pdg-radius']).toBe('0.25rem');
    expect(vars['--erp-bg']).toBe('#fff');
    expect(vars['--erp-accent']).toBe('#0658b0');
  });

  it('can be constructed independently of themeErp', () => {
    const custom = new GridTheme({
      ...themeErp.params,
      accentColor: '#111',
    });
    expect(custom.toCssVars()['--pdg-accent']).toBe('#111');
    expect(custom.toCssVars()['--erp-accent']).toBe('#111');
  });

  it('withParams keeps extraCssVars (dark palette extras)', () => {
    const next = themeErpDark.withParams({ accentColor: '#3b82f6' });
    expect(next.extraCssVars['--pdg-main-black']).toBe('#f4f4f4');
    expect(next.toCssVars()['--pdg-accent']).toBe('#3b82f6');
    expect(next.toCssVars()['--erp-accent']).toBe('#3b82f6');
    expect(next.toCssVars()['--erp-overlay']).toBe('rgba(0, 0, 0, 0.55)');
  });

  it('themeErpDark maps semantic tokens and leftover palette vars', () => {
    const vars = themeErpDark.toCssVars();
    expect(themeErpDark.params.rowHeight).toBe(40);
    expect(vars['--pdg-bg']).toBe('#171717');
    expect(vars['--erp-bg']).toBe('#171717');
    expect(vars['--erp-fg']).toBe('#f4f4f4');
    expect(vars['--erp-main-white']).toBe('#171717');
    expect(vars['--erp-main-black']).toBe('#f4f4f4');
    expect(vars['--erp-gray-7']).toBe('#a3a3a3');
  });
});
