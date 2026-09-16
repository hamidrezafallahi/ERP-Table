# persian-data-grid-codemod

Codemod for host migrations documented in [`MIGRATION.md`](../../MIGRATION.md) (PR-131).

```bash
npx persian-data-grid-codemod src/
# or from this repo:
node packages/codemod/cli.mjs src/
```

Covers:

- D13 renames (`ERPTable` → `DataGrid`, themes, hooks)
- D15/D16 subpath imports (Excel/PDF/FetchRemoteApi) + `styles.css` import
- D24 `await createERPTable(cfg)` → `createGrid` + `await grid.ready`
- CSS `.erp-table` / `--erp-*` → `.pdg-grid` / `--pdg-*`
- D18 note when `Alt+C/X/V` is found

Does **not** implement D22 monorepo splits (decision still open).
