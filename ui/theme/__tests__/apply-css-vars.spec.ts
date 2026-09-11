import { describe, expect, it } from 'vitest';

import {
  assignThemeVars,
  getRememberedThemeVars,
  rememberThemeVars,
  themeToStyle,
} from '../applyCssVars';
import { themeErp } from '../GridTheme';

describe('applyCssVars', () => {
  it('themeToStyle merges extra properties after CSS vars', () => {
    const style = themeToStyle(themeErp, { position: 'fixed', top: 10 });
    expect(style['--erp-accent']).toBe('#0658b0');
    expect(style.position).toBe('fixed');
    expect(style.top).toBe(10);
  });

  it('rememberThemeVars is what toasts copy onto document.body nodes', () => {
    const pink = themeErp.withParams({ accentColor: 'hotpink' });
    rememberThemeVars(pink.toCssVars());
    expect(getRememberedThemeVars()['--erp-accent']).toBe('hotpink');

    const el = {
      style: {
        props: {} as Record<string, string>,
        setProperty(key: string, value: string) {
          this.props[key] = value;
        },
      },
    };
    assignThemeVars(el as unknown as HTMLElement);
    expect(el.style.props['--erp-accent']).toBe('hotpink');

    rememberThemeVars(themeErp.toCssVars());
  });
});
