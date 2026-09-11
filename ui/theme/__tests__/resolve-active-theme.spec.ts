import { describe, expect, it } from 'vitest';

import { themeErp, themeErpDark } from '../GridTheme';
import {
  isStockTheme,
  resolveActiveTheme,
} from '../resolveActiveTheme';

describe('resolveActiveTheme', () => {
  it('defaults to themeErp and is not locked', () => {
    const result = resolveActiveTheme({ preferDark: false });
    expect(result.locked).toBe(false);
    expect(result.theme).toBe(themeErp);
  });

  it('switches stock light/dark without locking', () => {
    const dark = resolveActiveTheme({
      requested: themeErp,
      preferDark: true,
    });
    expect(dark.locked).toBe(false);
    expect(dark.theme).toBe(themeErpDark);

    const fromDark = resolveActiveTheme({
      requested: themeErpDark,
      preferDark: false,
    });
    expect(fromDark.locked).toBe(false);
    expect(fromDark.theme).toBe(themeErp);
  });

  it('locks custom withParams themes so the product toggle hides', () => {
    const custom = themeErp.withParams({ accentColor: 'hotpink' });
    expect(isStockTheme(custom)).toBe(false);
    const result = resolveActiveTheme({
      requested: custom,
      preferDark: true,
    });
    expect(result.locked).toBe(true);
    expect(result.theme).toBe(custom);
    expect(result.theme.params.accentColor).toBe('hotpink');
  });
});
