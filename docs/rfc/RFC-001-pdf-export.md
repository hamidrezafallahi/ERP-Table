# RFC-001 — PDF Export Plugin

## Status

Accepted (PR-29)

## Summary

User requests PDF export; a plugin builds a blob from a read-only snapshot. Domain aggregates are not mutated.

## Command / Intent

Host calls `PluginHost.requestExport({ format: 'pdf', collectionScope: 'active', correlationId })`.

This publishes `EXPORT_REQUESTED` on the **view stream** `table/{id}/view` (not the document stream), so undo of cell edits does not reverse PDF side-effects.

## Events

| Type | When | Payload |
|------|------|---------|
| `EXPORT_REQUESTED` | Immediately | `{ format: 'pdf', collectionScope }` |
| `PDF_EXPORT_COMPLETED` | Success | `{ format, rowCount, blobId? }` |
| `PDF_EXPORT_FAILED` | Failure | `{ format, code, message }` |

## Ownership

- Folder: `packages/plugins/pdf`
- Port: `application/ports/PdfRenderer` (jsPDF stays out of Core)
- Default renderer: `TextPdfRenderer` (minimal PDF; Host may inject jsPDF)

## Out of scope

- Changes to `Table` / `Row` / `Cell`
- Document-stream append for export completion
