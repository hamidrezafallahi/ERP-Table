/**
 * Compat wrapper — prefer `npx persian-data-grid-codemod` (PR-131).
 * D13: ERPTable → DataGrid (implemented in packages/codemod).
 * D18 clipboard: migrate Alt+C/X/V docs to Ctrl+C/X/V (handled in packages/codemod).
 * @deprecated Use packages/codemod
 */
export {
  transformSource,
  applyCodemod,
  runCli,
} from '../packages/codemod/index.mjs';

import { runCli } from '../packages/codemod/index.mjs';

function isDirectRun() {
  if (!process.argv[1]) return false;
  const self = process.argv[1].replace(/\\/g, '/').toLowerCase();
  return self.endsWith('codemod-v0.7.mjs');
}

if (isDirectRun()) {
  runCli(process.argv.slice(2));
}
