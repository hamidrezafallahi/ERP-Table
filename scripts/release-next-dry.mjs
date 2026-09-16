/**
 * Dry-run a `next` channel publish for PR-134 verify.
 * Does not upload; packs the tarball and prints the npm publish command.
 * Uses --ignore-scripts so local dry-run does not re-run prepublishOnly
 * (CI / tag push still runs the full gate via release.yml).
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

if (!String(pkg.version).includes('-next.')) {
  console.error(
    `Expected a next prerelease version (e.g. 0.13.0-next.0), got ${pkg.version}`,
  );
  process.exit(1);
}

const pack = spawnSync('npm', ['pack', '--dry-run'], {
  cwd: root,
  encoding: 'utf8',
  shell: true,
});
if (pack.status !== 0) {
  console.error(pack.stderr || pack.stdout);
  process.exit(pack.status ?? 1);
}
console.log(pack.stdout || '');

const publishDry = spawnSync(
  'npm',
  [
    'publish',
    '--dry-run',
    '--ignore-scripts',
    '--tag',
    'next',
    '--access',
    'public',
  ],
  { cwd: root, encoding: 'utf8', shell: true },
);

console.log(publishDry.stdout || '');
if (publishDry.status !== 0) {
  console.error(publishDry.stderr || '');
  process.exit(publishDry.status ?? 1);
}

console.log(`\nnext-channel dry-run ok: ${pkg.name}@${pkg.version} (tag next)`);
console.log(
  'Real publish: git tag v' +
    pkg.version +
    ' && git push origin v' +
    pkg.version +
    '  → Release workflow uses npm publish --tag next --provenance',
);
