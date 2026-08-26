# Event Catalog

Stable event type tokens for plugins, audit UIs, and host integrations.

Source of truth in code: `application/events/eventCatalog.ts`.

## Domain / Application events

| Type | Category | Undoable | Notes |
|------|----------|----------|-------|
| `CELL_CHANGED` | cell | yes | Includes `previousValue` / `newValue` |
| `CELL_DISPLAY_CHANGED` | cell | no | Display text only |
| `DYNAMIC_PROJECTION_DONE` | dynamic | no | Async projection finished |
| `ROW_ADDED` | row | yes | Compensating undo = delete; redo = `RESTORE_ADDED_ROW` (same id + cell snapshot). Also emitted by `PASTE_ROW`. |
| `NEW_ROW_ADDED` | row | yes | With initial values when present; same undo/redo as `ROW_ADDED` |
| `ROW_DELETED` | row | yes | Soft delete; undo toggles restore. Also used in cut+paste units. |
| `NEW_ROW_REMOVED` | row | yes | Hard remove of Added row; undo = `RESTORE_ADDED_ROW` |
| `ROW_RESTORED` | row | no | Restore soft-deleted / modified |
| `ROW_REORDERED` | row | no | Index reorder |
| `ROW_DESCRIPTION_SAVED` | row | no | Description flag |
| `COLUMN_REORDERED` | column | no | Column order |
| `UNIT_COLUMN_ADDED` | column | no | Dynamic unit column |
| `PAGE_CHANGED` | view | no | View stream |
| `PAGE_SIZE_CHANGED` | view | no | View stream |
| `VIEWPORT_CHANGED` | view | no | Virtual scroll window |
| `ACTIVE_COLLECTION_CHANGED` | view | no | Collection switch |
| `TABLE_DELETED` | table | no | Remove table |
| `TABLE_RESET` | table | no | Reset table |
| `DYNAMIC_DATA_REQUESTED` | dynamic | no | Remote fetch requested |
| `VALIDATION_FAILED` | error | no | Invariant violation |
| `EXPORT_REQUESTED` | plugin | no | PDF/Excel plugin trigger |
| `XLSX_EXPORT_COMPLETED` | plugin | no | Excel blob ready |
| `XLSX_EXPORT_FAILED` | plugin | no | Excel export error |
| `PDF_EXPORT_COMPLETED` | plugin | no | PDF blob ready |
| `PDF_EXPORT_FAILED` | plugin | no | PDF export error |

## Envelope

All stored events use `GridEvent`:

- `eventId`, `type`, `tableId`, `streamId`, `version`, `occurredAt`, `actorId`
- optional `correlationId` / `causationId` for batch undo and tracing
- `payload` — typed per event

## Plugin contract

Plugins should:

1. Subscribe via `EventStore.subscribe` / `subscribeAll` or changelog projection.
2. Never mutate Domain aggregates directly.
3. Read data through `GridQueryPort.getExportSource` / `getSnapShot` (via `PluginHost`).
4. Emit completion/failure events on the view stream (e.g. `PDF_EXPORT_COMPLETED`, `XLSX_EXPORT_COMPLETED`).

See `docs/rfc/RFC-001-pdf-export.md` and `packages/plugins/{excel,pdf}`.
