/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';

import { ERPTableHostProvider } from '../../host/ERPTableHost';
import { NewDatePicker } from '../DatePicker';

beforeAll(() => {
  // jsdom has no matchMedia; the picker reads it for its mobile/desktop layout.
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(cleanup);

const MARCH_20_2024 = Date.UTC(2024, 2, 20, 12);

describe('NewDatePicker (react-persian-range-picker)', () => {
  it('shows a Jalali date for the fa locale', () => {
    const { container } = render(
      <ERPTableHostProvider locale="fa">
        <NewDatePicker value={MARCH_20_2024} showMask />
      </ERPTableHostProvider>,
    );
    const text = [...container.querySelectorAll('input')].map((i) => i.value).join(' ') + container.textContent;
    expect(text).toMatch(/۱۴۰۳|1403/);
  });

  it('shows a Gregorian date for the en locale', () => {
    const { container } = render(
      <ERPTableHostProvider locale="en">
        <NewDatePicker value={MARCH_20_2024} showMask />
      </ERPTableHostProvider>,
    );
    const text = [...container.querySelectorAll('input')].map((i) => i.value).join(' ') + container.textContent;
    expect(text).toMatch(/2024/);
  });

  it('renders a disabled trigger carrying the grid class when disabled', () => {
    const { container } = render(
      <ERPTableHostProvider locale="fa">
        <NewDatePicker value={MARCH_20_2024} disabled />
      </ERPTableHostProvider>,
    );
    const trigger = container.querySelector('button[disabled]');
    expect(trigger).not.toBeNull();
    expect(trigger?.className).toContain('pdg-date-picker');
  });
});
