import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-57 cell-components host guide', () => {
  it('teaches registry APIs without sending the host into CellRenderer', () => {
    const doc = load('docs/cell-components.md');
    expect(doc).toContain('CellRenderContext');
    expect(doc).toContain('dispatchChangeValue');
    expect(doc).toContain('components={{ checkbox: HostCheckbox }}');
    expect(doc).toContain('columns[].render');
    expect(doc).toContain('DEFAULT_CELL_COMPONENTS');
    expect(doc).toContain('textArea');
    expect(doc).toContain('data-erp-cell-textarea');
    expect(doc).toContain('shouldSkipGridNavigation');
    expect(doc).toContain('highlightIfCurrentSearch');
    expect(doc).toContain('returnDisplayValue');
    expect(doc).toContain('filterComponents');
    expect(doc).toContain('FilterComponent');
    expect(doc).toMatch(/without.*CellRenderer/i);
    expect(doc).toContain('Do not');
    expect(doc).toContain('Fork `CellRenderer`');
    expect(doc).not.toContain('open ui/cellRenderer/index.tsx');
  });

  it('is linked from public-api, getting-started, README, and components docs', () => {
    expect(load('docs/public-api.md')).toContain('cell-components.md');
    expect(load('docs/getting-started.md')).toContain('cell-components.md');
    expect(load('README.md')).toContain('docs/cell-components.md');
    expect(load('docs/components.md')).toContain('cell-components.md');
  });

  it('documented APIs still exist in the package', () => {
    expect(load('ui/cellRenderer/cellRenderContext.ts')).toContain(
      'export interface CellRenderContext',
    );
    expect(load('ui/index.tsx')).toContain('components?: CellComponentMap');
    expect(load('ui/cellRenderer/cellRegistry.ts')).toContain(
      'textArea: TextAreaCell',
    );
    expect(load('ui/cellRenderer/index.tsx')).not.toMatch(
      /case\s+['"]textArea['"]/,
    );
  });
});
