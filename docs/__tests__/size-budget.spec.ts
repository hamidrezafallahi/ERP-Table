import { randomBytes } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MAIN_GZIP_LIMIT_BYTES,
  checkGzipUnderLimit,
  checkRawBounds,
  MIN_RAW_BYTES,
  MAX_RAW_BYTES,
} from '../../scripts/sizeBudget.mjs';

describe('size budget (PR-73)', () => {
  it('main gzip ceiling is 65 KB after PR-76', () => {
    expect(MAIN_GZIP_LIMIT_BYTES).toBe(65 * 1024);
  });

  it('.size-limit.js declares budgets for current and future subpaths', async () => {
    const config = (await import('../../.size-limit.js')).default;
    expect(Array.isArray(config)).toBe(true);
    // Only existing dist artifacts are active; at least main after build.
    const names = config.map((e: { name: string }) => e.name);
    if (existsSync(join(process.cwd(), 'dist/index.js'))) {
      expect(names).toContain('.');
      const main = config.find((e: { name: string }) => e.name === '.');
      expect(main?.limit).toBe('65 KB');
    }
    const source = readFileSync(join(process.cwd(), '.size-limit.js'), 'utf8');
    for (const sub of [
      './headless',
      './plugins/excel',
      './plugins/pdf',
      './plugins/pdf/fonts/vazirmatn',
      './adapters/arian-erp',
      './styles.css',
    ]) {
      expect(source).toContain(sub);
    }
  });

  it('checkGzipUnderLimit passes for small payloads', () => {
    const result = checkGzipUnderLimit('hello world', MAIN_GZIP_LIMIT_BYTES);
    expect(result.ok).toBe(true);
  });

  it('checkGzipUnderLimit fails for an artificially heavy payload (CI red path)', () => {
    // High-entropy blob does not compress under the 175 KB ceiling.
    const heavy = randomBytes(200_000);
    const result = checkGzipUnderLimit(heavy, MAIN_GZIP_LIMIT_BYTES);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.gzipBytes).toBeGreaterThan(MAIN_GZIP_LIMIT_BYTES);
    }
  });

  it('checkRawBounds enforces min and max', () => {
    expect(checkRawBounds(MIN_RAW_BYTES - 1).ok).toBe(false);
    expect(checkRawBounds(MIN_RAW_BYTES).ok).toBe(true);
    expect(checkRawBounds(MAX_RAW_BYTES).ok).toBe(true);
    expect(checkRawBounds(MAX_RAW_BYTES + 1).ok).toBe(false);
  });

  it('built dist/index.js stays under the gzip ceiling when present', () => {
    const path = join(process.cwd(), 'dist/index.js');
    if (!existsSync(path)) {
      return;
    }
    const buf = readFileSync(path);
    const raw = checkRawBounds(buf.length);
    expect(raw.ok).toBe(true);
    const gz = checkGzipUnderLimit(buf, MAIN_GZIP_LIMIT_BYTES);
    expect(gz.ok).toBe(true);
  });
});
