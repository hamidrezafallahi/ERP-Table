import { describe, expect, it } from 'vitest';
import { GridTheme, themeErp, themeErpDark } from '../GridTheme';

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

  it('toCssVars maps params to --erp-* role tokens', () => {
    const vars = themeErp.toCssVars();
    expect(vars['--erp-bg']).toBe('#fff');
    expect(vars['--erp-fg']).toBe('#292929');
    expect(vars['--erp-accent']).toBe('#0658b0');
    expect(vars['--erp-header-bg']).toBe('#f4f4f4');
    expect(vars['--erp-row-stripe']).toBe('#ddecfd');
    expect(vars['--erp-row-selected']).toBe('#dbeafe');
    expect(vars['--erp-border']).toBe('#ececec');
    expect(vars['--erp-danger']).toBe('#dc2626');
    expect(vars['--erp-search-match']).toBe('#facc15');
    expect(vars['--erp-font']).toBe('IRANSans, Tahoma, sans-serif');
    expect(vars['--erp-row-height']).toBe('40px');
    expect(vars['--erp-font-size']).toBe('12px');
    expect(vars['--erp-radius']).toBe('0.25rem');
  });

  it('can be constructed independently of themeErp', () => {
    const custom = new GridTheme({
      ...themeErp.params,
      accentColor: '#111',
    });
    expect(custom.toCssVars()['--erp-accent']).toBe('#111');
  });

  it('withParams keeps extraCssVars (dark palette extras)', () => {
    const next = themeErpDark.withParams({ accentColor: '#3b82f6' });
    expect(next.extraCssVars['--erp-main-black']).toBe('#f4f4f4');
    expect(next.toCssVars()['--erp-accent']).toBe('#3b82f6');
    expect(next.toCssVars()['--erp-overlay']).toBe('rgba(0, 0, 0, 0.55)');
  });

  it('themeErpDark maps semantic tokens and leftover palette vars', () => {
    const vars = themeErpDark.toCssVars();
    expect(themeErpDark.params.rowHeight).toBe(40);
    expect(vars['--erp-bg']).toBe('#171717');
    expect(vars['--erp-fg']).toBe('#f4f4f4');
    expect(vars['--erp-main-white']).toBe('#171717');
    expect(vars['--erp-main-black']).toBe('#f4f4f4');
    expect(vars['--erp-gray-7']).toBe('#a3a3a3');
  });
});
