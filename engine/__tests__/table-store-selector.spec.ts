import { describe, expect, it, vi } from 'vitest';

import { TableStore } from '../tableStore';
import { structuralEqual } from '../equality';

describe('TableStore.subscribeWithSelector', () => {
  it('notifies only when selected slice changes', () => {
    const store = new TableStore({ count: 0, label: 'a' });
    const listener = vi.fn();

    store.subscribeWithSelector((s) => s.count, listener);

    store.setState((prev) => ({ ...prev, label: 'b' }));
    expect(listener).not.toHaveBeenCalled();

    store.setState((prev) => ({ ...prev, count: 1 }));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it('supports custom equality for structural snapshots', () => {
    const store = new TableStore({ rows: [{ id: 1, name: 'a' }] });
    const listener = vi.fn();

    store.subscribeWithSelector(
      (s) => s.rows,
      listener,
      structuralEqual,
    );

    store.setState(() => ({ rows: [{ id: 1, name: 'a' }] }));
    expect(listener).not.toHaveBeenCalled();

    store.setState(() => ({ rows: [{ id: 1, name: 'b' }] }));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
