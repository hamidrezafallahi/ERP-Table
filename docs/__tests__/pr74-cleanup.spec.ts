import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === '__tests__' || name === 'node_modules') continue;
      walkTsFiles(full, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('PR-74 dead code / host-glue cleanup', () => {
  it('DesktopTable comment matches resolveDesktopVirtualization (default off)', () => {
    const desktop = readFileSync(join(root, 'ui/desktop/DesktopTable.tsx'), 'utf8');
    const resolve = readFileSync(
      join(root, 'ui/desktop/resolveDesktopVirtualization.ts'),
      'utf8',
    );
    expect(resolve).toContain('virtualization === true && !!session');
    expect(desktop).toMatch(/Off by default/i);
    expect(desktop).not.toMatch(/Default true when `session` is present/);
  });

  it('handleSelectAllRows is wired in the toolbar JSX', () => {
    const src = readFileSync(join(root, 'ui/desktop/groupActionButtons.tsx'), 'utf8');
    expect(src).toContain('handleSelectAllRows');
    expect(src).toMatch(/onClick=\{handleSelectAllRows\}/);
  });

  it('host-glue left the package ui/ tree for examples/host-arian-erp', () => {
    expect(() =>
      readFileSync(join(root, 'ui/useERPGrid.ts'), 'utf8'),
    ).toThrow();
    expect(() =>
      readFileSync(
        join(root, 'ui/cellRenderer/descriptionComponent/useVoucherDescription.tsx'),
        'utf8',
      ),
    ).toThrow();
    expect(
      readFileSync(join(root, 'examples/host-arian-erp/useERPGrid.ts'), 'utf8'),
    ).toContain('export function useERPGrid');
    expect(
      readFileSync(
        join(root, 'examples/host-arian-erp/useVoucherDescription.tsx'),
        'utf8',
      ),
    ).toContain('useVoucherDescription');
  });

  it('no @ts-nocheck remains under ui/**', () => {
    const files = walkTsFiles(join(root, 'ui'));
    const offenders = files.filter((f) =>
      readFileSync(f, 'utf8').includes('@ts-nocheck'),
    );
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });
});
