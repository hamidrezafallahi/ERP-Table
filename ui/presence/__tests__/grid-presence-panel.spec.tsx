/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GridPresencePanel } from '../GridPresencePanel';
import { GridPresenceService } from '../../../application/presence/GridPresenceService';
import { InMemoryPresenceHub } from '../../../infrastructure/presence/InMemoryPresenceHub';
import { UITableController } from '../../../infrastructure/ui/UITableController';
import { TableEngine } from '../../../engine/tableEngine';
import { ConsoleAuditLogger } from '../../../infrastructure/Repositories/consoleAuditLogger';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

describe('PR-139 GridPresencePanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('lists remote peers with active cell', () => {
    const hub = new InMemoryPresenceHub();
    const engine = {
      dispatch: async () => undefined,
      getActiveCell: () => null,
    } as unknown as TableEngine;
    const controller = new UITableController(
      engine,
      'test',
      'presence-ui',
      new ConsoleAuditLogger(),
    );
    const local = new GridPresenceService({
      tableId: 'presence-ui',
      actorId: 'local',
      transport: hub.transportFor('local'),
      peerId: 'local',
    });
    const remote = new GridPresenceService({
      tableId: 'presence-ui',
      actorId: 'remote',
      label: 'Remote',
      transport: hub.transportFor('remote'),
      peerId: 'remote',
      color: '#ef4444',
    });
    controller.setPresencePort(local);
    remote.setActiveCell(3, 'item');

    render(<GridPresencePanel controller={controller} />);

    expect(document.querySelector('[data-pdg-presence-panel]')).toBeTruthy();
    const peer = document.querySelector(
      '[data-pdg-presence-peer="remote"]',
    ) as HTMLElement;
    expect(peer).toBeTruthy();
    expect(peer.getAttribute('data-pdg-presence-cell')).toBe('3:item');

    remote.dispose();
    local.dispose();
  });
});
