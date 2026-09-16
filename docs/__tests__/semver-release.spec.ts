import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-134 semver and next-channel publish (D25)', () => {
  const pkg = JSON.parse(load('package.json')) as {
    version?: string;
    scripts?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  it('ships 0.13.0-next.0 with changesets and dry-run scripts', () => {
    expect(pkg.version).toBe('0.13.0-next.0');
    expect(pkg.devDependencies?.['@changesets/cli']).toBeTruthy();
    expect(pkg.scripts?.changeset).toBe('changeset');
    expect(pkg.scripts?.['changeset:version']).toContain('changeset version');
    expect(pkg.scripts?.['release:notes']).toContain('extract-changelog');
    expect(pkg.scripts?.['release:next:dry']).toContain('release-next-dry');
    expect(existsSync(join(root, '.changeset/config.json'))).toBe(true);
    expect(existsSync(join(root, 'scripts/extract-changelog.mjs'))).toBe(true);
    expect(existsSync(join(root, 'scripts/release-next-dry.mjs'))).toBe(true);
  });

  it('documents D25 semver and next vs latest publish', () => {
    const contributing = load('CONTRIBUTING.md');
    expect(contributing).toContain('Versioning (D25)');
    expect(contributing).toContain('0.13.0-next');
    expect(contributing).toContain('release-gate');
    expect(contributing).toContain('--tag next');

    const changelog = load('CHANGELOG.md');
    expect(changelog).toContain('[0.13.0-next.0]');
    expect(changelog).toContain('PR-134');

    const release = load('.github/workflows/release.yml');
    expect(release).toContain('npm publish --provenance');
    expect(release).toContain('tag=next');
    expect(release).toContain('extract-changelog.mjs');
    expect(release).toContain('softprops/action-gh-release');
  });
});
