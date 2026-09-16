/**
 * Optional presence UI subpath (PR-139).
 * Keep out of `.` to preserve the 65 KB gzip main ceiling.
 */
export { GridPresencePanel } from '../ui/presence';
export type { GridPresencePanelProps } from '../ui/presence';
export type {
  PresencePeer,
  PresencePort,
  PresenceTransport,
  PresenceMessage,
  PresenceLocalState,
} from '../application/ports/PresencePort';
