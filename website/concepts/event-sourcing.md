# Event sourcing

When you pass a `store`, cell edits append domain events to IndexedDB instead of mutating a silent snapshot. That enables:

- undo / redo of cell history
- audit-friendly trails (who / when / from → to)
- offline recovery after refresh

Without `store`, the grid stays **in-memory** (zero-config path). No IndexedDB is opened.

```ts
const grid = createGrid({
  store: 'erp',
  tableKey: 'voucher-1',
  actor: { userId: 'u1', roles: ['admin'] },
  columnDefs: [{ field: 'qty', type: 'number' }],
  rowData: [{ qty: 1 }],
});
await grid.ready;
```

Default remote sync is a no-op. Inject `FetchRemoteApi` from `persian-data-grid/adapters/arian-erp` for arianERP hosts.
