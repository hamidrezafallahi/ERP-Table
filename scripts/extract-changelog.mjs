/**
 * Extract a CHANGELOG section for GitHub Release notes.
 * Usage: node scripts/extract-changelog.mjs [version]
 * Default version = package.json version.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = process.argv[2] ?? pkg.version;
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');

const header = `## [${version}]`;
const start = changelog.indexOf(header);
if (start < 0) {
  // Fall back to Unreleased
  const unreleased = changelog.indexOf('## [Unreleased]');
  if (unreleased < 0) {
    console.log(`Release ${version}\n\nSee CHANGELOG.md.`);
    process.exit(0);
  }
  const rest = changelog.slice(unreleased);
  const next = rest.search(/\n## \[/);
  const body = (next < 0 ? rest : rest.slice(0, next)).trim();
  console.log(body.replace('## [Unreleased]', `## ${version} (from Unreleased)`));
  process.exit(0);
}

const fromHeader = changelog.slice(start);
const nextHeader = fromHeader.search(/\n## \[/);
const section =
  nextHeader < 0 ? fromHeader.trim() : fromHeader.slice(0, nextHeader).trim();
console.log(section);
