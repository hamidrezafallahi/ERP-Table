'use client';

import React, { useEffect, useState } from 'react';

import type {
  ManualResolution,
  SyncConflict,
  SyncConflictPolicy,
} from '../../application/ports/SyncPort';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import { useTranslations } from '../host';

export type GridSyncPanelProps = {
  controller: UITableController;
  className?: string;
};

const POLICIES: SyncConflictPolicy[] = [
  'lastWriteWins',
  'serverWins',
  'manual',
];

/**
 * Sync policy + conflict resolution UI (PR-138).
 * Requires `createGrid({ syncTransport })`.
 */
export function GridSyncPanel({ controller, className }: GridSyncPanelProps) {
  const t = useTranslations();
  const [policy, setPolicy] = useState<SyncConflictPolicy | undefined>(() =>
    controller.getSyncPolicy(),
  );
  const [conflicts, setConflicts] = useState<readonly SyncConflict[]>(() =>
    controller.getOpenSyncConflicts(),
  );
  const [busy, setBusy] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    setPolicy(controller.getSyncPolicy());
    return controller.subscribeSyncConflicts(setConflicts);
  }, [controller]);

  if (!controller.getSyncPort()) {
    return null;
  }

  const onPolicyChange = (next: SyncConflictPolicy) => {
    controller.setSyncPolicy(next);
    setPolicy(next);
  };

  const onSync = async () => {
    setBusy(true);
    setLastMessage(null);
    try {
      const result = await controller.syncNow();
      if (!result) {
        setLastMessage(t('sync.unavailable'));
        return;
      }
      setLastMessage(
        t('sync.result', {
          pushed: result.pushed,
          pulled: result.pulled,
          conflicts: result.conflicts.length,
        }),
      );
      setConflicts(controller.getOpenSyncConflicts());
    } finally {
      setBusy(false);
    }
  };

  const onResolve = async (
    conflictId: string,
    choice: ManualResolution,
  ) => {
    setBusy(true);
    try {
      await controller.resolveSyncConflict(conflictId, choice);
      setConflicts(controller.getOpenSyncConflicts());
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside
      className={['pdg-sync-panel', className].filter(Boolean).join(' ')}
      data-pdg-sync-panel=""
    >
      <div className="pdg-sync-panel__row">
        <label className="pdg-sync-panel__policy">
          <span>{t('sync.policy')}</span>
          <select
            data-pdg-sync-policy=""
            value={policy ?? 'lastWriteWins'}
            disabled={busy}
            onChange={(e) =>
              onPolicyChange(e.target.value as SyncConflictPolicy)
            }
          >
            {POLICIES.map((p) => (
              <option key={p} value={p}>
                {t(`sync.policy.${p}`)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          data-pdg-sync-now=""
          disabled={busy}
          onClick={() => void onSync()}
        >
          {busy ? t('sync.syncing') : t('sync.now')}
        </button>
      </div>
      {lastMessage ? (
        <p className="pdg-sync-panel__status" data-pdg-sync-status="">
          {lastMessage}
        </p>
      ) : null}
      {conflicts.length > 0 ? (
        <ul className="pdg-sync-panel__conflicts" data-pdg-sync-conflicts="">
          {conflicts.map((c) => (
            <li key={c.id} data-pdg-sync-conflict={c.id}>
              <span className="pdg-sync-panel__conflict-key">
                {c.key.rowId}:{c.key.columnId}
              </span>
              <span className="pdg-sync-panel__conflict-values">
                {t('sync.local')}: {String(c.local.value)} / {t('sync.remote')}:{' '}
                {String(c.remote.value)}
              </span>
              {policy === 'manual' ? (
                <span className="pdg-sync-panel__conflict-actions">
                  <button
                    type="button"
                    data-pdg-sync-keep-local=""
                    disabled={busy}
                    onClick={() => void onResolve(c.id, 'local')}
                  >
                    {t('sync.keepLocal')}
                  </button>
                  <button
                    type="button"
                    data-pdg-sync-keep-remote=""
                    disabled={busy}
                    onClick={() => void onResolve(c.id, 'remote')}
                  >
                    {t('sync.keepRemote')}
                  </button>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
