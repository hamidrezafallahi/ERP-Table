/** Peer presence snapshot (PR-139). */
export type PresencePeer = {
  readonly peerId: string;
  readonly actorId: string;
  readonly label: string;
  readonly color: string;
  /** Active cell, if any. */
  readonly rowId: number | null;
  readonly columnId: string | null;
  readonly updatedAt: number;
};

export type PresenceLocalState = {
  readonly peerId: string;
  readonly actorId: string;
  readonly label: string;
  readonly color: string;
  rowId: number | null;
  columnId: string | null;
};

export type PresenceMessage =
  | {
      readonly kind: 'presence';
      readonly peer: PresencePeer;
    }
  | {
      readonly kind: 'leave';
      readonly peerId: string;
    };

export type PresenceTransport = {
  publish(message: PresenceMessage): void;
  subscribe(listener: (message: PresenceMessage) => void): () => void;
};

export type PresencePort = {
  getLocal(): PresenceLocalState;
  getPeers(): readonly PresencePeer[];
  /** Update local cursor / focus cell and broadcast. */
  setActiveCell(rowId: number | null, columnId: string | null): void;
  /** Announce leave and stop. */
  dispose(): void;
  subscribe(listener: (peers: readonly PresencePeer[]) => void): () => void;
};
