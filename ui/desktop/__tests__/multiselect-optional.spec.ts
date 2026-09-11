import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-53 optional multiSelectConfig', () => {
  it('ERPTable / desktop / mobile types treat multiSelectConfig as optional', () => {
    expect(load('ui/index.tsx')).toContain('multiSelectConfig?: IMultiSelectConfig');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain(
      'multiSelectConfig?: IMultiSelectConfig',
    );
    expect(load('ui/mobile/MobileTable.tsx')).toContain(
      'multiSelectConfig?: IMultiSelectConfig',
    );
  });

  it('toolbar hides choose-from-list until config is passed', () => {
    expect(load('ui/desktop/groupActionButtons.tsx')).toContain(
      '{multiSelectConfig && (',
    );
    expect(load('ui/mobile/MobileActionButtons.tsx')).toContain(
      '{multiSelectConfig && (',
    );
    expect(load('ui/optional-multiselect.typecheck.tsx')).not.toMatch(
      /multiSelectConfig\s*=/,
    );
  });
});
