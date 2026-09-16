# Architecture

`persian-data-grid` splits into layers:

| Layer | Role |
|-------|------|
| `domain/` | Entities, commands, pure value objects — no React/DOM |
| `application/` | Session, handlers, ports — no React/DOM |
| `engine/` | Sort, filter, aggregation, selection — pure functions |
| `infrastructure/` | IndexedDB, adapters, `GridApi` |
| `ui/` | React chrome (`DataGrid`) |
| `bootstrap/` | `createGrid` composition root |

Hosts usually use either:

1. **React** — `<DataGrid rowData columnDefs />`
2. **Headless** — `createGrid()` then bind your own view to `session` / `controller`

Heavy optional surfaces (Excel, PDF, CSV, arian-erp adapter, Jalali range picker) live on **subpath exports** so the root bundle stays within the gzip budget.

See also [Event sourcing](./event-sourcing).
