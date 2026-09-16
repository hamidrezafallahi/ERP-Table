/**
 * PR-133 verify: run Playwright e2e N times; fail if flake rate >= 1%.
 * Usage: node scripts/e2e-flake-check.mjs [runs=10]
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const runs = Math.max(1, Number(process.argv[2] ?? 10));
let failures = 0;

for (let i = 1; i <= runs; i++) {
  console.log(`\n=== e2e flake run ${i}/${runs} ===`);
  const result = spawnSync(
    process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
    ['e2e', '--reporter=line'],
    {
      cwd: root,
      env: { ...process.env, CI: process.env.CI },
      stdio: 'inherit',
      shell: true,
    },
  );
  if (result.status !== 0) failures += 1;
}

const rate = failures / runs;
const allowed = Math.floor(runs * 0.01);
console.log(`\nFlake check: ${failures}/${runs} failed (${(rate * 100).toFixed(1)}%, allowed ≤ ${allowed})`);
if (failures > allowed) {
  console.error('Fail: flake rate must be < 1%.');
  process.exit(1);
}
console.log('Pass: flake rate < 1%.');
