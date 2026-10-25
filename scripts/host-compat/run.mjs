#!/usr/bin/env node
/**
 * Host-compat harness: type-checks the arianERP (newFront) consumer files of the
 * erp-table twice and prints the errors that exist ONLY after migrating to the
 * library's public entry points.
 *
 *   (a) baseline : newFront's own tsconfig paths (in-project erp-table)
 *   (b) migrated : every `@components/organisms/erp-table[/...]` specifier remapped
 *                  to `publish/entry.ts` (the page hook `ui/useERPGrid.ts` is host
 *                  glue: a copy with rewritten relative imports is used instead).
 *
 * Usage: node scripts/host-compat/run.mjs [newFrontPath] [--verbose]
 * Exit code 1 when (b) has errors that (a) does not.
 * Generated files live in scripts/host-compat/.tmp/ (git-ignored). Nothing is
 * ever written inside newFront; tsc runs with --noEmit --incremental false.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const libRoot = path.resolve(here, '..', '..');
const tmpDir = path.join(here, '.tmp');
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const hostRoot = path.resolve(args.find((a) => !a.startsWith('--')) ?? 'C:\\fallahi\\newFront');
const fwd = (p) => p.replace(/\\/g, '/');
const ts = createRequire(import.meta.url)('typescript');

const ENTRY = fwd(path.join(libRoot, 'publish', 'entry'));
const HOOK_REL = 'components/organisms/erp-table/ui/useERPGrid.ts';
const HOOK_COPY = path.join(tmpDir, 'useERPGrid.ts');
const TABLE_DIR = 'components/organisms/erp-table';

/** Consumer files that import the in-project table (re-discovered below). */
const DEFAULT_CONSUMERS = [
  'components/organisms/receiptAndPayment/bank/withdrawal/config.ts',
  'components/organisms/receiptAndPayment/bank/withdrawal/index.tsx',
  'components/organisms/receiptAndPayment/bank/withdrawal/useAdvancedBankWithdrawalERPGrid.ts',
  'components/organisms/receiptAndPayment/cheque&promissoryNote/RejectCheque/RejectChequeOrganism.tsx',
  'components/organisms/receiptAndPayment/cheque&promissoryNote/RejectCheque/config.ts',
  'components/organisms/receiptAndPayment/cheque&promissoryNote/assignmentCheque/AssignmentChequeOrganism.tsx',
  'components/organisms/receiptAndPayment/cheque&promissoryNote/assignmentCheque/chequeTransferReport.tsx',
  'components/organisms/receiptAndPayment/cheque&promissoryNote/assignmentCheque/config.ts',
  'components/organisms/receiptAndPayment/cheque&promissoryNote/chequeReversal/ChequeReversalOrganism.tsx',
  'components/organisms/receiptAndPayment/cheque&promissoryNote/chequeReversal/config.ts',
  'components/organisms/receiptAndPayment/cheque&promissoryNote/collectionCheque/CollectionChequeOrganism.tsx',
  'components/organisms/receiptAndPayment/cheque&promissoryNote/collectionCheque/config.ts',
  'components/templates/inventoryVoucherTemplate/config.ts',
  'components/templates/inventoryVoucherTemplate/index.tsx',
  'components/templates/priceAnnouncementTemplate/config.ts',
  'components/templates/treasury/receiptAndPayment/bankedChequeDeploymentTemplate/config.ts',
  'components/templates/treasury/receiptAndPayment/bankedChequeDeploymentTemplate/index.tsx',
  ...['deploy', 'issuance', 'receipt'].flatMap((d) =>
    ['checkConfig.ts', 'index.tsx', 'promissoryNoteConfig.ts'].map(
      (f) => `components/templates/treasury/receiptAndPayment/cheque&promissoryNote/${d}/${f}`,
    ),
  ),
  'components/templates/voucherTemplate/config.ts',
  'components/templates/voucherTemplate/index.tsx',
  'types/elementType.ts',
  'utils/chatPrefill.ts',
];

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', 'dist', '.git'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.d.ts')) out.push(full);
  }
}

function discoverConsumers() {
  const all = [];
  walk(hostRoot, all);
  const found = [];
  for (const f of all) {
    const rel = fwd(path.relative(hostRoot, f));
    if (rel.startsWith(`${TABLE_DIR}/`)) continue;
    if (fs.readFileSync(f, 'utf8').includes('organisms/erp-table')) found.push(rel);
  }
  return found;
}

const discovered = discoverConsumers();
const extra = discovered.filter((r) => !DEFAULT_CONSUMERS.includes(r));
const missingDefault = DEFAULT_CONSUMERS.filter((r) => !fs.existsSync(path.join(hostRoot, r)));
const consumers = [...new Set([...DEFAULT_CONSUMERS, ...discovered])].filter((r) =>
  fs.existsSync(path.join(hostRoot, r)),
);
if (extra.length) console.log(`[host-compat] consumers not in the default list (added):\n  ${extra.join('\n  ')}`);
if (missingDefault.length) console.log(`[host-compat] default consumers missing on disk:\n  ${missingDefault.join('\n  ')}`);

fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir, { recursive: true });

// ---- hook copy -------------------------------------------------------------
const hookSrc = fs.readFileSync(path.join(hostRoot, HOOK_REL), 'utf8');
const hookOut = hookSrc.replace(
  /(from\s+)(['"])(\.{1,2}\/[^'"]*)\2/g,
  (_m, pre, q) => `${pre}${q}${ENTRY}${q}`,
);
fs.writeFileSync(HOOK_COPY, `// GENERATED by scripts/host-compat/run.mjs from ${HOOK_REL}\n${hookOut}`);

// ---- tsconfigs -------------------------------------------------------------
const hostCfgRes = ts.readConfigFile(path.join(hostRoot, 'tsconfig.json'), ts.sys.readFile);
if (hostCfgRes.error) throw new Error('cannot read newFront tsconfig.json');
const hostPaths = {};
for (const [k, v] of Object.entries(hostCfgRes.config.compilerOptions?.paths ?? {})) {
  hostPaths[k] = v.map((p) => fwd(path.resolve(hostRoot, p)));
}
const ambient = ['next-env.d.ts', 'global.d.ts', 'globalTypes.ts', 'GlobalTypes.ts']
  .map((f) => path.join(hostRoot, f))
  .filter((f) => fs.existsSync(f));
const files = [...ambient, ...consumers.map((r) => path.join(hostRoot, r))].map(fwd);

const pre = '@components/organisms/erp-table';
const migratedPaths = {
  ...hostPaths,
  [pre]: [ENTRY],
  [`${pre}/ui`]: [ENTRY],
  [`${pre}/ui/useERPGrid`]: [fwd(HOOK_COPY)],
  [`${pre}/ui/type`]: [ENTRY],
  [`${pre}/engine/type`]: [ENTRY],
  [`${pre}/domain/value-objects`]: [ENTRY],
  [`${pre}/bootstrap`]: [ENTRY],
  [`${pre}/bootstrap/type`]: [ENTRY],
  [`${pre}/infrastructure/ui/UITableController`]: [ENTRY],
  // The hook copy lives outside newFront: resolve bare packages from newFront
  // (also gives the library a single copy of react types, like a real install).
  // @types first: with allowJs a plain `react/jsx-runtime.js` would win otherwise.
  '*': [fwd(path.join(hostRoot, 'node_modules', '@types', '*')), fwd(path.join(hostRoot, 'node_modules', '*'))],
};

function writeCfg(name, paths) {
  const cfg = {
    extends: fwd(path.join(hostRoot, 'tsconfig.json')),
    compilerOptions: {
      noEmit: true,
      incremental: false,
      composite: false,
      typeRoots: [fwd(path.join(hostRoot, 'node_modules', '@types'))],
      plugins: [],
      jsx: 'react-jsx',
      ...(paths ? { paths } : {}),
    },
    include: [],
    files,
  };
  const file = path.join(tmpDir, name);
  fs.writeFileSync(file, JSON.stringify(cfg, null, 2));
  return file;
}
const cfgA = writeCfg('tsconfig.baseline.json', null);
const cfgB = writeCfg('tsconfig.migrated.json', migratedPaths);

// ---- run tsc ---------------------------------------------------------------
const tscBin = path.join(libRoot, 'node_modules', 'typescript', 'bin', 'tsc');
function runTsc(cfg) {
  const r = spawnSync(
    process.execPath,
    [tscBin, '-p', cfg, '--noEmit', '--incremental', 'false', '--composite', 'false', '--pretty', 'false'],
    { cwd: tmpDir, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  );
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
}

function normPath(p) {
  const abs = path.resolve(tmpDir, p);
  if (abs === HOOK_COPY) return `host:${HOOK_REL}`;
  const relHost = path.relative(hostRoot, abs);
  if (!relHost.startsWith('..')) return `host:${fwd(relHost)}`;
  const relLib = path.relative(libRoot, abs);
  if (!relLib.startsWith('..')) return `lib:${fwd(relLib)}`;
  return fwd(abs);
}

function parse(out) {
  const errs = [];
  let cur = null;
  for (const line of out.split(/\r?\n/)) {
    const m = /^(.*?)\((\d+),(\d+)\): error (TS\d+): (.*)$/.exec(line);
    if (m) {
      cur = { file: normPath(m[1]), line: +m[2], col: +m[3], code: m[4], msg: m[5] };
      errs.push(cur);
      continue;
    }
    const g = /^error (TS\d+): (.*)$/.exec(line);
    if (g) {
      errs.push({ file: '<global>', line: 0, col: 0, code: g[1], msg: g[2] });
      cur = null;
    } else if (cur && /^\s+/.test(line) && line.trim()) {
      cur.msg += `\n${line}`;
    }
  }
  return errs;
}

const key = (e) => `${e.file}:${e.line}:${e.col}:${e.code}`;
console.log(`[host-compat] host=${hostRoot}  files=${files.length}`);
console.log('[host-compat] running baseline ...');
const outA = runTsc(cfgA);
console.log('[host-compat] running migrated ...');
const outB = runTsc(cfgB);
fs.writeFileSync(path.join(tmpDir, 'baseline.out.txt'), outA);
fs.writeFileSync(path.join(tmpDir, 'migrated.out.txt'), outB);
const errA = parse(outA);
const errB = parse(outB);
const keysA = new Set(errA.map(key));
const keysB = new Set(errB.map(key));
const onlyB = errB.filter((e) => !keysA.has(key(e)));
const onlyA = errA.filter((e) => !keysB.has(key(e)));
console.log(`[host-compat] baseline errors=${errA.length}  migrated errors=${errB.length}`);
console.log(`[host-compat] errors only in migrated: ${onlyB.length}   (only in baseline: ${onlyA.length})`);

function symbolOf(e) {
  const m =
    /Property '([^']+)'/.exec(e.msg) ??
    /(?:Module '[^']*' has no exported member|Cannot find name|Cannot find module) '([^']+)'/.exec(e.msg) ??
    /Types of property '([^']+)'/.exec(e.msg);
  if (m) return m[1];
  const q = /'([^']{1,60})'/.exec(e.msg);
  return q ? q[1] : e.code;
}
const groups = new Map();
for (const e of onlyB) {
  const g = `${symbolOf(e)}  [${e.code}]`;
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(e);
}
for (const [g, list] of [...groups.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n== ${g}  x${list.length}`);
  for (const e of list.slice(0, verbose ? list.length : 3)) {
    const lines = e.msg.split('\n').slice(0, verbose ? 14 : 3);
    console.log(`  ${e.file}:${e.line}:${e.col}\n    ${lines.join('\n    ')}`);
  }
  if (!verbose && list.length > 3) console.log(`  ... +${list.length - 3} more (use --verbose)`);
}
if (onlyB.length === 0) console.log('\n[host-compat] OK: migrated has no errors beyond baseline.');
console.log(`\n[host-compat] raw tsc output in ${tmpDir}`);
process.exit(onlyB.length ? 1 : 0);
