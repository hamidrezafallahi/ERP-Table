import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
}

/** Drop string literals so ops like BooleanFilterOp `'any'` are not false positives. */
function stripStringLiterals(source: string): string {
  return source
    .replace(/'(?:\\.|[^'\\])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
    .replace(/`(?:\\.|[^`\\])*`/g, ' ');
}

function walkDts(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkDts(full, acc);
    else if (name.endsWith('.d.ts') || name.endsWith('.d.cts')) acc.push(full);
  }
  return acc;
}

describe('PR-79 zero any on the public surface', () => {
  it('eslint bans explicit any on the publish graph', () => {
    const cfg = load('eslint.config.js');
    expect(cfg).toContain("@typescript-eslint/no-explicit-any");
    expect(cfg).toMatch(/no-explicit-any['"]:\s*'error'/);
    const pkg = JSON.parse(load('package.json')) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.['lint:publish']).toContain('eslint');
    expect(load('CONTRIBUTING.md')).toContain('lint:publish');
  });

  it('priority public types no longer use any', () => {
    expect(load('application/ports/RemoteApi.ts')).not.toMatch(/\bany\b/);
    expect(load('ui/type.ts')).not.toMatch(/\bany\b/);
    expect(load('domain/value-objects/index.ts')).not.toMatch(
      /transform\?: \(value: any\)/,
    );
    expect(load('domain/types/ColumnSchema.ts')).not.toMatch(/\bany\b/);
    expect(load('domain/types/ColumnDef.ts')).not.toMatch(/\bany\b/);
  });

  it('built dist typings contain zero any (after yarn build)', () => {
    const dist = join(root, 'dist');
    const files = walkDts(dist);
    if (files.length === 0) return;
    const hits = files.filter((file) =>
      /\bany\b/.test(
        stripStringLiterals(stripComments(readFileSync(file, 'utf8'))),
      ),
    );
    expect(hits.map((f) => f.slice(dist.length + 1))).toEqual([]);
  });
});
