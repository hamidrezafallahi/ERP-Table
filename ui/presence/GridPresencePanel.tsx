'use client';

import React, { useEffect, useState } from 'react';

import type { PresencePeer } from '../../application/ports/PresencePort';
import type { UITableController } from '../../infrastructure/ui/UITableController';

export type GridPresencePanelProps = {
  controller: UITableController;
  className?: string;
};

/**
 * Peer presence list (PR-139). Requires `createGrid({ presence: true })`
 * or an injected `presenceTransport`. Ships on `persian-data-grid/presence`.
 */
export function GridPresencePanel({
  controller,
  className,
}: GridPresencePanelProps) {
  const [peers, setPeers] = useState<readonly PresencePeer[]>(() =>
    controller.getPresencePeers(),
  );

  useEffect(() => {
    if (!controller.getPresencePort()) {
      setPeers([]);
      return;
    }
    return controller.subscribePresencePeers(setPeers);
  }, [controller]);

  if (!controller.getPresencePort()) return null;

  return (
    <aside
      className={['pdg-presence-panel', className].filter(Boolean).join(' ')}
      data-pdg-presence-panel=""
    >
      <div className="pdg-presence-panel__title">Present</div>
      {peers.length === 0 ? (
        <p className="pdg-presence-panel__empty" data-pdg-presence-empty="">
          No other editors
        </p>
      ) : (
        <ul className="pdg-presence-panel__list" data-pdg-presence-list="">
          {peers.map((peer) => (
            <li
              key={peer.peerId}
              data-pdg-presence-peer={peer.peerId}
              data-pdg-presence-cell={
                peer.rowId != null && peer.columnId
                  ? `${peer.rowId}:${peer.columnId}`
                  : ''
              }
            >
              <span
                className="pdg-presence-panel__dot"
                style={{ background: peer.color }}
                aria-hidden
              />
              <span className="pdg-presence-panel__label">{peer.label}</span>
              <span className="pdg-presence-panel__cell">
                {peer.rowId != null && peer.columnId
                  ? `${peer.rowId}:${peer.columnId}`
                  : 'Idle'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
