import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'fflate';

const ttf = new Uint8Array(
  readFileSync('packages/plugins/pdf/fonts/Vazirmatn-Regular.ttf'),
);
const deflated = deflateSync(ttf, { level: 9 });
const b64 = Buffer.from(deflated).toString('base64');
const lines = b64.match(/.{1,120}/g).map((s) => JSON.stringify(s)).join('\n+\n');

const src = `/* Generated from fonts/Vazirmatn-Regular.ttf (SIL OFL 1.1). See fonts/OFL.txt. */
import { inflateSync } from 'fflate';

const DEFLATED_B64 =
${lines};

let cached: Uint8Array | null = null;

export function vazirmatnRegularBytes(): Uint8Array {
  if (cached) return cached;
  const binary = atob(DEFLATED_B64);
  const compressed = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    compressed[i] = binary.charCodeAt(i);
  }
  cached = inflateSync(compressed);
  return cached;
}

export const VAZIRMATN_TTF_LENGTH = ${ttf.length};
`;

writeFileSync('packages/plugins/pdf/src/vazirmatnBytes.ts', src);
console.log(
  JSON.stringify({
    ttf: ttf.length,
    deflated: deflated.length,
    b64: b64.length,
    src: src.length,
  }),
);
