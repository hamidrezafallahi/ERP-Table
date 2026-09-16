'use client';

import React, { useEffect, useState } from 'react';

import type {
  Connectivity,
  PendingChange,
} from '../../application/offline/OfflineStatus';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import { useTranslations } from '../host';

export type GridOfflineStatusProps = {
  controller: UITableController;
  className?: string;
  /** Show the pending mutation list (default true). */
  showQueue?: boolean;
};

/**
 * Online/offline badge + pending local mutations (PR-137).
 */
export function GridOfflineStatus({
  controller,
  className,
  showQueue = true,
}: GridOfflineStatusProps) {
  const t = useTranslations();
  const [connectivity, setConnectivity] = useState<Connectivity>(() =>
    controller.getConnectivity(),
  );
  const [pending, setPending] = useState<readonly PendingChange[]>(() =>
    controller.getPendingChanges(),
  );

  useEffect(() => {
    const unsubConn = controller.subscribeConnectivity(setConnectivity);
    const unsubPending = controller.subscribePendingChanges(setPending);
    return () => {
      unsubConn();
      unsubPending();
    };
  }, [controller]);

  const count = pending.length;
  const pendingLabel =
    count === 0
      ? t('offline.pendingEmpty')
      : t('offline.pendingCount', { count });

  return (
    <aside
      className={['pdg-offline-status', className].filter(Boolean).join(' ')}
      data-pdg-offline-status=""
      data-pdg-connectivity={connectivity}
      aria-live="polite"
    >
      <div className="pdg-offline-status__row">
        <span
          className="pdg-offline-status__badge"
          data-pdg-offline-badge=""
        >
          {connectivity === 'online'
            ? t('offline.online')
            : t('offline.offline')}
        </span>
        <span
          className="pdg-offline-status__pending"
          data-pdg-offline-pending-count={count}
        >
          {pendingLabel}
        </span>
      </div>
      {showQueue && count > 0 ? (
        <ol className="pdg-offline-status__queue" data-pdg-offline-queue="">
          {pending.map((item) => (
            <li
              key={item.eventId}
              data-pdg-offline-queue-item={item.eventId}
              data-pdg-offline-queue-type={item.type}
            >
              {item.summary}
            </li>
          ))}
        </ol>
      ) : null}
    </aside>
  );
}
