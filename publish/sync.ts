/**
 * Optional sync UI subpath (PR-138/139).
 * Keep out of `.` to preserve the 65 KB gzip main ceiling.
 */
export { GridSyncPanel } from '../ui/sync';
export type { GridSyncPanelProps } from '../ui/sync';
export type {
  SyncConflict,
  SyncConflictPolicy,
  SyncConflictSide,
  SyncPort,
  SyncResult,
  SyncTransport,
  ManualResolution,
} from '../application/ports/SyncPort';
