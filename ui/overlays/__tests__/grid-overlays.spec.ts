import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { resolveGridOverlay } from '../resolveGridOverlay';
import { GridOverlays } from '../GridOverlays';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import { themeDark, themeDefault } from '../../theme';
import { isServerLoadingRow, SERVER_ROW_LOADING_FLAG } from '../../../engine/dataOps/rowModel';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-103 resolveGridOverlay', () => {
  it('prefers loading over no-rows', () => {
    expect(resolveGridOverlay(true, 0)).toBe('loading');
    expect(resolveGridOverlay(true, 10)).toBe('loading');
    expect(resolveGridOverlay(false, 0)).toBe('noRows');
    expect(resolveGridOverlay(undefined, 0)).toBe('noRows');
    expect(resolveGridOverlay(false, 3)).toBe(null);
  });
});

describe('PR-103 server loading row flag', () => {
  it('detects __pdgLoading marker', () => {
    expect(isServerLoadingRow({ [SERVER_ROW_LOADING_FLAG]: true })).toBe(true);
    expect(isServerLoadingRow({ id: 1 })).toBe(false);
    expect(isServerLoadingRow(null)).toBe(false);
  });
});

describe('PR-103 GridOverlays DOM', () => {
  it('renders loading overlay', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        ERPTableHostProvider,
        { locale: 'en', theme: themeDefault },
        React.createElement(GridOverlays, { loading: true, rowCount: 0 }),
      ),
    );
    expect(html).toContain('data-pdg-overlay="loading"');
    expect(html).toContain('Loading');
  });

  it('renders no-rows overlay', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        ERPTableHostProvider,
        { locale: 'en', theme: themeDefault },
        React.createElement(GridOverlays, { loading: false, rowCount: 0 }),
      ),
    );
    expect(html).toContain('data-pdg-overlay="noRows"');
    expect(html).toContain('No data');
  });

  it('renders custom loading overlay and dark theme root stays compatible', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        ERPTableHostProvider,
        { locale: 'en', theme: themeDark },
        React.createElement(GridOverlays, {
          loading: true,
          rowCount: 5,
          loadingOverlayComponent: () =>
            React.createElement('div', { 'data-custom-loading': '1' }, 'Wait'),
        }),
      ),
    );
    expect(html).toContain('data-custom-loading="1"');
    expect(html).toContain('Wait');
    expect(load('ui/styles/erp-table.css')).toContain('.pdg-overlay');
    expect(load('ui/styles/erp-table.css')).toContain(
      ".pdg-grid[data-erp-theme='dark'] .pdg-row-skeleton__bar",
    );
  });

  it('hides when rows exist and not loading', () => {
    const html = renderToStaticMarkup(
      React.createElement(GridOverlays, { loading: false, rowCount: 2 }),
    );
    expect(html).toBe('');
  });
});

describe('PR-103 wiring', () => {
  it('wires props through DataGrid and DesktopTable', () => {
    expect(load('ui/index.tsx')).toContain('loadingOverlayComponent');
    expect(load('ui/index.tsx')).toContain('noRowsOverlayComponent');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('GridOverlays');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('pdg-row-skeleton');
    expect(load('engine/ViewStateBuilder.ts')).toContain('isServerLoadingRow');
    expect(load('publish/entry.ts')).toContain('resolveGridOverlay');
  });
});
