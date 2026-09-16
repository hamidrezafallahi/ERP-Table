import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-52 / PR-80 arianERP host adapter docs', () => {
  it('documents cookie, persist key, and Defaults without making Fetch the default', () => {
    const doc = load('examples/host-arian-erp/host-arian-erp.md');
    expect(doc).toContain('_auth');
    expect(doc).toContain('persist:arianERP');
    expect(doc).toContain('Defaults');
    expect(doc).toContain('NoopRemoteApi');
    expect(doc).toContain('new FetchRemoteApi()');
    expect(doc).toContain('constructed by bootstrap');
    expect(doc).toContain('persian-data-grid/adapters/arian-erp');
    expect(doc).toContain('persian-data-grid-events');
    expect(doc).toContain('eventStoreName');
  });

  it('FetchRemoteApi still implements the documented adapter (not deleted)', () => {
    const src = load('infrastructure/Repositories/fetchRemoteApi.ts');
    expect(src).toContain("readCookie('_auth')");
    expect(src).toContain("localStorage.getItem('persist:arianERP')");
    expect(src).toContain('Defaults:');
    expect(src).toContain('export class FetchRemoteApi');
    expect(load('bootstrap/index.ts')).not.toContain('FetchRemoteApi');
    expect(load('publish/entry.ts')).not.toContain('FetchRemoteApi');
    expect(load('index.ts')).not.toContain('FetchRemoteApi');
  });

  it('README install does not promise ERP connection without remoteApi', () => {
    const readme = load('README.md');
    expect(readme).toMatch(/does \*\*not\*\* connect to arianERP/i);
    expect(readme).toContain('NoopRemoteApi');
    expect(readme).toContain('examples/host-arian-erp/host-arian-erp.md');
    expect(readme).not.toContain('docs/host-arian-erp.md');
    expect(readme).not.toMatch(/FetchRemoteApi is the default/i);
    expect(readme).not.toMatch(/automatically connects/i);
  });

  it('moved the adapter contract out of docs/ into examples/', () => {
    expect(() => load('docs/host-arian-erp.md')).toThrow();
    expect(load('examples/host-arian-erp/README.md')).toContain(
      'host-arian-erp.md',
    );
  });
});
