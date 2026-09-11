/**
 * Shared size-budget helpers for verify-dist and CI tests.
 */
import { gzipSync } from 'node:zlib';

/** Today's main-bundle gzip ceiling (PR-76 / D15). */
export const MAIN_GZIP_LIMIT_BYTES = 65 * 1024;

/** Raw floor — rejects legacy stub builds. */
export const MIN_RAW_BYTES = 5_000;

/**
 * Raw ceiling — catches catastrophic growth of the main entry before gzip check.
 * After PR-76 splits, the entry is much smaller than the old 600 KB monolith.
 */
export const MAX_RAW_BYTES = 400_000;

/**
 * @param {Buffer | Uint8Array | string} content
 * @param {number} limitBytes
 * @returns {{ ok: true; gzipBytes: number } | { ok: false; gzipBytes: number; limitBytes: number }}
 */
export function checkGzipUnderLimit(content, limitBytes) {
  const buf = typeof content === 'string' ? Buffer.from(content) : Buffer.from(content);
  const gzipBytes = gzipSync(buf, { level: 9 }).length;
  if (gzipBytes > limitBytes) {
    return { ok: false, gzipBytes, limitBytes };
  }
  return { ok: true, gzipBytes };
}

/**
 * @param {number} rawBytes
 * @param {{ min?: number; max?: number }} bounds
 * @returns {{ ok: true } | { ok: false; reason: string }}
 */
export function checkRawBounds(rawBytes, bounds = {}) {
  const min = bounds.min ?? MIN_RAW_BYTES;
  const max = bounds.max ?? MAX_RAW_BYTES;
  if (rawBytes < min) {
    return { ok: false, reason: `too small (${rawBytes} < ${min})` };
  }
  if (rawBytes > max) {
    return { ok: false, reason: `too large (${rawBytes} > ${max})` };
  }
  return { ok: true };
}
