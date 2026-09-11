import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { isApplicationTableCommand } from '../../../application/commands';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-58 column resize wiring', () => {
  it('desktop header exposes a resize handle on th', () => {
    const header = load('ui/desktop/ERPTableHeader.tsx');
    expect(header).toContain('ColumnResizeHandle');
    expect(header).toContain('UI_RESIZE_COLUMN');
    expect(load('ui/desktop/ColumnResizeHandle.tsx')).toContain(
      'data-erp-col-resize',
    );
  });

  it('RESIZE_COLUMN is an engine-only command', () => {
    expect(load('engine/tableEngine.ts')).toContain("case 'RESIZE_COLUMN'");
    expect(
      isApplicationTableCommand({
        type: 'RESIZE_COLUMN',
        tableKey: 't',
        columnId: 'name',
        width: 200,
      }),
    ).toBe(false);
    expect(load('application/TableAppService.ts')).not.toContain(
      'RESIZE_COLUMN',
    );
  });

  it('mobile has no resize handle', () => {
    expect(load('ui/mobile/MobileTableHeader.tsx')).not.toContain(
      'data-erp-col-resize',
    );
    expect(load('ui/mobile/MobileTableHeader.tsx')).not.toContain(
      'ColumnResizeHandle',
    );
  });
});
