/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GridSyncPanel } from '../GridSyncPanel';
import {
  OfflineStatus,
  alwaysOnlineConnectivity,
} from '../../../application/offline/OfflineStatus';
import { GridSyncService } from '../../../application/sync/GridSyncService';
import { InMemoryEventStore } from '../../../infrastructure/eventStore/InMemoryEventStore';
import { InMemorySyncHub } from '../../../infrastructure/sync/InMemorySyncHub';
import { UITableController } from '../../../infrastructure/ui/UITableController';
import { TableEngine } from '../../../engine/tableEngine';
import { ConsoleAuditLogger } from '../../../infrastructure/Repositories/consoleAuditLogger';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import { themeDefault } from '../../theme';
import type { GridEvent } from '../../../domain/types/GridEvent';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

function cellEvent(eventId: string, value: string): GridEvent {
  return {
    eventId,
    type: 'CELL_CHANGED',
    tableId: 'sync-ui',
    streamId: 'table:sync-ui',
    version: 1,
    occurredAt: Date.now(),
    actorId: 'u1',
    payload: {
      rowId: 1,
      columnId: 'item',
      newValue: value,
      previousValue: '',
    },
  };
}

describe('PR-138 GridSyncPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows policy select and sync button when SyncPort is wired', async () => {
    const hub = new InMemorySyncHub();
    const store = new InMemoryEventStore();
    const offline = new OfflineStatus({
      tableId: 'sync-ui',
      connectivity: alwaysOnlineConnectivity,
    });
    await offline.start(store);

    const engine = {
      dispatch: async () => undefined,
    } as unknown as TableEngine;
    const controller = new UITableController(
      engine,
      'test',
      'sync-ui',
      new ConsoleAuditLogger(),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      offline,
    );
    const sync = new GridSyncService({
      tableId: 'sync-ui',
      eventStore: store,
      offlineStatus: offline,
      transport: hub.transportFor('ui'),
      applyCellValue: async () => undefined,
      policy: 'manual',
    });
    controller.setSyncPort(sync);

    await store.append('table:sync-ui', [cellEvent('e1', 'local')], -1);
    expect(offline.getPendingCount()).toBe(1);

    render(
      <ERPTableHostProvider locale="en" theme={themeDefault}>
        <GridSyncPanel controller={controller} />
      </ERPTableHostProvider>,
    );

    expect(document.querySelector('[data-pdg-sync-panel]')).toBeTruthy();
    const select = document.querySelector(
      '[data-pdg-sync-policy]',
    ) as HTMLSelectElement;
    expect(select.value).toBe('manual');

    await act(async () => {
      fireEvent.click(document.querySelector('[data-pdg-sync-now]')!);
    });
    expect(offline.getPendingCount()).toBe(0);
  });
});
