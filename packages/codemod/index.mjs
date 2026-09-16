/**
 * persian-data-grid-codemod (PR-131)
 *
 * Rewrites deprecated / broken host APIs for D13–D21 (D22 monorepo is still open).
 *
 * Usage:
 *   npx persian-data-grid-codemod <file-or-dir> [...]
 *   node packages/codemod/cli.mjs <file-or-dir> [...]
 *   node scripts/codemod-v0.7.mjs <file-or-dir> [...]  (compat alias)
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.css']);

/** Identifier renames (longest first). */
const IDENTIFIERS = [
  ['UseERPTableResult', 'UseGridResult'],
  ['ERPTableProps', 'DataGridProps'],
  ['injectERPTableStyles', 'injectGridStyles'],
  ['useERPTable', 'useGrid'],
  ['themeErpDark', 'themeDark'],
  ['themeErp', 'themeDefault'],
  ['ERPTable', 'DataGrid'],
];

const SUBPATH_MOVES = [
  {
    names: [
      'ExcelExportPlugin',
      'ExcelImportPlugin',
      'exportActiveCollectionToExcel',
      'buildExportTable',
      'buildXlsxBlob',
      'parseXlsxBlob',
      'mapImportedSheet',
      'applyImportedRows',
    ],
    to: 'persian-data-grid/plugins/excel',
  },
  {
    names: [
      'PdfExportPlugin',
      'TextPdfRenderer',
      'VazirmatnPdfRenderer',
      'createVazirmatnPdfExportPlugin',
      'createVazirmatnPdfRenderer',
    ],
    to: 'persian-data-grid/plugins/pdf',
  },
  {
    names: ['FetchRemoteApi'],
    to: 'persian-data-grid/adapters/arian-erp',
  },
  {
    names: ['UITableController'],
    to: 'persian-data-grid/headless',
    valueOnly: true,
  },
];

function rewriteIdentifiers(source) {
  let out = source;
  for (const [from, to] of IDENTIFIERS) {
    out = out.replace(new RegExp(`(?<![A-Za-z])${from}(?![A-Za-z])`, 'g'), to);
  }
  return out;
}

function rewriteCssTokens(source) {
  return source
    .replace(/\.erp-table\b/g, '.pdg-grid')
    .replace(/--erp-/g, '--pdg-');
}

function parseNamedImports(clause) {
  return clause
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^(type\s+)?(.+)$/);
      if (!m) return null;
      const isType = Boolean(m[1]);
      const rest = m[2].trim();
      const asMatch = rest.match(/^(\w+)\s+as\s+(\w+)$/);
      if (asMatch) {
        return { isType, name: asMatch[1], alias: asMatch[2] };
      }
      return { isType, name: rest, alias: null };
    })
    .filter(Boolean);
}

function formatNamed(parts) {
  return parts
    .map((p) => {
      const core = p.alias ? `${p.name} as ${p.alias}` : p.name;
      return p.isType ? `type ${core}` : core;
    })
    .join(', ');
}

function rewriteImports(source) {
  return source.replace(
    /import\s+(type\s+)?(?:(\w+)\s*,\s*)?\{([\s\S]*?)\}\s*from\s*(['"])persian-data-grid\4(\s*;?)/g,
    (full, typeKw, defaultImport, namedClause, quote, semi) => {
      const parts = parseNamedImports(namedClause);
      const keep = [];
      const moved = new Map();

      for (const part of parts) {
        let relocated = false;
        for (const move of SUBPATH_MOVES) {
          if (!move.names.includes(part.name)) continue;
          if (move.valueOnly && (part.isType || typeKw)) {
            keep.push(part);
            relocated = true;
            break;
          }
          const list = moved.get(move.to) ?? [];
          list.push(part);
          moved.set(move.to, list);
          relocated = true;
          break;
        }
        if (!relocated) keep.push(part);
      }

      if (moved.size === 0) return full;

      const lines = [];
      if (keep.length || defaultImport) {
        const mid = [
          defaultImport,
          keep.length ? `{ ${formatNamed(keep)} }` : null,
        ]
          .filter(Boolean)
          .join(', ');
        lines.push(
          `import ${typeKw ?? ''}${mid} from ${quote}persian-data-grid${quote}${semi || ';'}`,
        );
      }
      for (const [to, list] of moved) {
        lines.push(
          `import { ${formatNamed(list)} } from ${quote}${to}${quote}${semi || ';'}`,
        );
      }
      return lines.join('\n');
    },
  );
}

function ensureStylesImport(source) {
  if (!/from ['"]persian-data-grid['"]/.test(source)) return source;
  if (/persian-data-grid\/styles\.css/.test(source)) return source;
  if (!/\bDataGrid\b|\bERPTable\b/.test(source)) return source;
  const lines = source.split('\n');
  let lastIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/from ['"]persian-data-grid/.test(lines[i])) lastIdx = i;
  }
  if (lastIdx < 0) return source;
  lines.splice(lastIdx + 1, 0, "import 'persian-data-grid/styles.css';");
  return lines.join('\n');
}

/**
 * Only rewrite `await createERPTable(...)` assignment forms.
 * Leaves bare `createERPTable` references (still a valid deprecated alias).
 */
function rewriteCreateERPTable(source) {
  return source.replace(
    /\b(const|let|var)\s+(\w+)\s*=\s*await\s+createERPTable\s*\(([\s\S]*?)\);/g,
    (full, kind, name, args) => {
      if (/\bawait\s+\w+\.ready\b/.test(full)) return full;
      return `${kind} ${name} = createGrid(${args});\nawait ${name}.ready;`;
    },
  );
}

function ensureCreateGridImport(source) {
  if (!/\bcreateGrid\s*\(/.test(source)) return source;
  if (/\bcreateGrid\b/.test(source) && /import\s*\{[^}]*\bcreateGrid\b/.test(source)) {
    return source;
  }
  // If createERPTable is imported, add createGrid beside it
  if (/import\s*\{[^}]*\bcreateERPTable\b[^}]*\}\s*from\s*['"]persian-data-grid['"]/.test(source)) {
    return source.replace(
      /(import\s*\{[^}]*)\bcreateERPTable\b([^}]*\}\s*from\s*['"]persian-data-grid['"])/,
      '$1createERPTable, createGrid$2',
    );
  }
  if (/\bcreateGrid\s*\(/.test(source) && !/\bcreateGrid\b.*from\s*['"]persian-data-grid/.test(source)) {
    return `import { createGrid } from 'persian-data-grid';\n` + source;
  }
  return source;
}

function annotateAltShortcuts(source) {
  if (!/Alt\s*\+\s*[CXV]/i.test(source) && !/Alt\+[CXV]/.test(source)) {
    return source;
  }
  if (source.includes('D18 clipboard')) return source;
  return (
    `/* D18 clipboard: prefer Ctrl+C/X/V; Alt+C/X/V are deprecated aliases until 1.0.0 */\n` +
    source
  );
}

export function transformSource(source, filePath = '') {
  const isCss = filePath.endsWith('.css');
  let out = source;
  if (isCss) {
    return rewriteCssTokens(out);
  }
  out = rewriteImports(out);
  out = rewriteCreateERPTable(out);
  out = ensureCreateGridImport(out);
  out = rewriteIdentifiers(out);
  out = rewriteCssTokens(out);
  out = ensureStylesImport(out);
  out = annotateAltShortcuts(out);
  return out;
}

function walk(path, files) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
      walk(join(path, name), files);
    }
    return;
  }
  if (EXTENSIONS.has(extname(path))) files.push(path);
}

export function applyCodemod(paths) {
  const files = [];
  for (const path of paths) walk(path, files);
  const changed = [];
  for (const file of files) {
    const before = readFileSync(file, 'utf8');
    const after = transformSource(before, file);
    if (after !== before) {
      writeFileSync(file, after);
      changed.push(file);
    }
  }
  return changed;
}

export function runCli(argv = process.argv.slice(2)) {
  if (argv.length === 0) {
    console.error('Usage: persian-data-grid-codemod <file-or-dir> [...]');
    process.exit(1);
  }
  const changed = applyCodemod(argv);
  for (const file of changed) console.log(file);
  console.log(`rewrote ${changed.length} file(s)`);
  return changed;
}
