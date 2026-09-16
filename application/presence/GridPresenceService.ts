import type {
  PresenceLocalState,
  PresenceMessage,
  PresencePeer,
  PresencePort,
  PresenceTransport,
} from '../ports/PresencePort';

const PEER_COLORS = [
  '#0ea5e9',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

export type GridPresenceServiceOptions = {
  readonly tableId: string;
  readonly actorId: string;
  readonly label?: string;
  readonly transport: PresenceTransport;
  readonly peerId?: string;
  readonly color?: string;
  /** Drop peers quieter than this (ms). Default 15s. */
  readonly staleMs?: number;
};

function hashColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PEER_COLORS[h % PEER_COLORS.length]!;
}

/**
 * PresencePort: broadcast local cursor/selection; track remote peers (PR-139).
 * Does not merge cell values — editing different cells stays conflict-free.
 */
export class GridPresenceService implements PresencePort {
  private readonly local: PresenceLocalState;
  private peers = new Map<string, PresencePeer>();
  private readonly listeners = new Set<
    (peers: readonly PresencePeer[]) => void
  >();
  private unsub: (() => void) | null = null;
  private disposed = false;
  private readonly staleMs: number;

  constructor(private readonly options: GridPresenceServiceOptions) {
    const peerId =
      options.peerId ??
      `peer:${options.actorId}:${Math.random().toString(36).slice(2, 9)}`;
    this.local = {
      peerId,
      actorId: options.actorId,
      label: options.label ?? options.actorId,
      color: options.color ?? hashColor(peerId),
      rowId: null,
      columnId: null,
    };
    this.staleMs = options.staleMs ?? 15_000;
    this.unsub = options.transport.subscribe((message) => {
      this.onMessage(message);
    });
    this.broadcast();
  }

  getLocal(): PresenceLocalState {
    return { ...this.local };
  }

  getPeers(): readonly PresencePeer[] {
    this.pruneStale();
    return [...this.peers.values()].filter(
      (p) => p.peerId !== this.local.peerId,
    );
  }

  setActiveCell(rowId: number | null, columnId: string | null): void {
    if (this.disposed) return;
    this.local.rowId = rowId;
    this.local.columnId = columnId;
    this.broadcast();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.options.transport.publish({
      kind: 'leave',
      peerId: this.local.peerId,
    });
    this.unsub?.();
    this.unsub = null;
    this.peers.clear();
    this.emit();
  }

  subscribe(listener: (peers: readonly PresencePeer[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getPeers());
    return () => this.listeners.delete(listener);
  }

  private broadcast(): void {
    const peer: PresencePeer = {
      peerId: this.local.peerId,
      actorId: this.local.actorId,
      label: this.local.label,
      color: this.local.color,
      rowId: this.local.rowId,
      columnId: this.local.columnId,
      updatedAt: Date.now(),
    };
    this.options.transport.publish({ kind: 'presence', peer });
  }

  private onMessage(message: PresenceMessage): void {
    if (message.kind === 'leave') {
      if (message.peerId === this.local.peerId) return;
      this.peers.delete(message.peerId);
      this.emit();
      return;
    }
    if (message.peer.peerId === this.local.peerId) return;
    this.peers.set(message.peer.peerId, message.peer);
    this.emit();
  }

  private pruneStale(): void {
    const cutoff = Date.now() - this.staleMs;
    for (const [id, peer] of this.peers) {
      if (peer.updatedAt < cutoff) this.peers.delete(id);
    }
  }

  private emit(): void {
    const snapshot = this.getPeers();
    for (const listener of this.listeners) listener(snapshot);
  }
}
