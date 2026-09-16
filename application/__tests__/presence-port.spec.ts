import { describe, expect, it } from 'vitest';

import { GridPresenceService } from '../presence/GridPresenceService';
import { InMemoryPresenceHub } from '../../infrastructure/presence/InMemoryPresenceHub';

describe('PR-139 PresencePort two sessions', () => {
  it('BroadcastChannel-equivalent hub shares peer cursors', () => {
    const hub = new InMemoryPresenceHub();
    const a = new GridPresenceService({
      tableId: 't1',
      actorId: 'alice',
      label: 'Alice',
      transport: hub.transportFor('A'),
      peerId: 'peer-a',
      color: '#0ea5e9',
    });
    const b = new GridPresenceService({
      tableId: 't1',
      actorId: 'bob',
      label: 'Bob',
      transport: hub.transportFor('B'),
      peerId: 'peer-b',
      color: '#f59e0b',
    });

    // B announces on construct — A should see Bob (possibly idle)
    a.setActiveCell(1, 'name');
    expect(b.getPeers().some((p) => p.peerId === 'peer-a')).toBe(true);
    const aliceOnB = b.getPeers().find((p) => p.peerId === 'peer-a')!;
    expect(aliceOnB.rowId).toBe(1);
    expect(aliceOnB.columnId).toBe('name');

    b.setActiveCell(2, 'qty');
    const bobOnA = a.getPeers().find((p) => p.peerId === 'peer-b')!;
    expect(bobOnA.rowId).toBe(2);
    expect(bobOnA.columnId).toBe('qty');

    // Different cells — both peers remain visible (no conflict)
    expect(aliceOnB.columnId).not.toBe(bobOnA.columnId);

    b.dispose();
    expect(a.getPeers().find((p) => p.peerId === 'peer-b')).toBeUndefined();
    a.dispose();
  });

  it('leave removes peer from the other session', () => {
    const hub = new InMemoryPresenceHub();
    const a = new GridPresenceService({
      tableId: 't1',
      actorId: 'a',
      transport: hub.transportFor('A'),
      peerId: 'pa',
    });
    const b = new GridPresenceService({
      tableId: 't1',
      actorId: 'b',
      transport: hub.transportFor('B'),
      peerId: 'pb',
    });
    a.setActiveCell(1, 'x');
    expect(b.getPeers().length).toBeGreaterThan(0);
    a.dispose();
    expect(b.getPeers()).toHaveLength(0);
    b.dispose();
  });
});
