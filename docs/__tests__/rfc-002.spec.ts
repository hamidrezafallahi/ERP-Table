import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-117 RFC-002 aggregation / grouping', () => {
  it('RFC file exists and covers required decision areas', () => {
    const rfc = load('docs/rfc/RFC-002-aggregation-grouping.md');
    expect(rfc).toContain('# RFC-002');
    expect(rfc).toContain('## Status');
    expect(rfc).toContain('EventStore');
    expect(rfc).toContain('Undo');
    expect(rfc).toContain('Virtualization');
    expect(rfc).toContain('Excel');
    expect(rfc).toContain('PDF');
    expect(rfc).toContain('CSV');
    expect(rfc).toContain('aggFunc');
    expect(rfc).toContain('groupBy');
    expect(rfc).toContain('Accepted');
  });

  it('execution plan gates PR-118+ on RFC-002', () => {
    const plan = load('EXECUTION_PLAN.md');
    expect(plan).toContain('RFC-002-aggregation-grouping.md');
    expect(plan).toContain('بدون تأیید این RFC، PR-118 به بعد شروع نشود');
  });
});
