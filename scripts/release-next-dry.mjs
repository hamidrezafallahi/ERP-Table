/**
 * Dry-run a publish (any semver: `latest` for plain, `next` for prerelease).
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

// Plain versions (0.6.0) publish to `latest`; prereleases (0.13.0-next.0) to `next`.
const distTag = String(pkg.version).includes('-') ? 'next' : 'latest';

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
    distTag,
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

console.log(`\ndry-run ok: ${pkg.name}@${pkg.version} (tag ${distTag})`);
console.log(
  'Real publish: git tag v' +
    pkg.version +
    ' && git push origin v' +
    pkg.version +
    '  → Release workflow uses npm publish --tag ' + distTag + ' --provenance',
);
