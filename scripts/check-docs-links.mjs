/**
 * PR-129: fail the docs build when markdown relative links are broken.
 * Skips http(s), mailto, anchors-only, and /api/ (TypeDoc HTML tree).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const website = join(root, 'website');
const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'public' || name === '.vitepress') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

const broken = [];
for (const file of walk(website)) {
  const text = readFileSync(file, 'utf8');
  const base = dirname(file);
  let m;
  while ((m = linkRe.exec(text))) {
    const href = m[2].trim().split(/\s+/)[0].replace(/^<|>$/g, '');
    if (!href || href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
      continue;
    }
    if (href.startsWith('/api') || href.includes('/api/')) continue;
    const pathOnly = href.split('#')[0].split('?')[0];
    if (!pathOnly) continue;
    const target = pathOnly.startsWith('/')
      ? join(website, pathOnly.replace(/^\//, ''))
      : resolve(base, pathOnly);
    const candidates = [
      target,
      `${target}.md`,
      join(target, 'index.md'),
      join(target, 'index.html'),
    ].map((c) => normalize(c));
    if (!candidates.some((c) => existsSync(c))) {
      broken.push(`${file.replace(root + '\\', '').replace(root + '/', '')}: ${href}`);
    }
  }
}

if (broken.length) {
  console.error(`Broken docs links (${broken.length}):\n${broken.map((b) => `  - ${b}`).join('\n')}`);
  process.exit(1);
}
console.log('docs link check: 0 broken relative links');
