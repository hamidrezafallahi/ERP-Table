import { describe, expect, it } from 'vitest';

import { InMemoryEventStore } from '../eventStore/InMemoryEventStore';
import { IndexedDbEventStore } from '../eventStore/IndexedDbEventStore';
import { TableStore } from '../../engine/tableStore';
import {
  checkBudget,
  DEFAULT_PERFORMANCE_BUDGETS,
  runBenchmark,
} from '../perf/benchmark';
import type { GridEvent } from '../../domain/types/GridEvent';

function makeEvent(i: number): GridEvent {
  return {
    eventId: `e${i}`,
    type: 'CELL_CHANGED',
    tableId: 't1',
    streamId: 's1',
    version: 0,
    occurredAt: Date.now(),
    actorId: 'system',
    payload: { rowId: 1, columnId: 'c', newValue: i, previousValue: i - 1 },
  };
}

describe('performance budgets', () => {
  it('keeps InMemoryEventStore append batch under budget', async () => {
    const store = new InMemoryEventStore();
    let version = 0;

    const sample = await runBenchmark('inMemoryAppend100', 5, async () => {
      const batch = Array.from({ length: 20 }, (_, i) => makeEvent(version + i));
      const result = await store.append('s1', batch, version);
      if (!result.ok) throw new Error('append conflict');
      version = result.version;
    });

    const checked = checkBudget(sample, DEFAULT_PERFORMANCE_BUDGETS.inMemoryAppend100);
    expect(checked.ok, checked.reasons.join('; ')).toBe(true);
  });

  it('keeps IndexedDbEventStore (memory backend) append under budget', async () => {
    const store = IndexedDbEventStore.inMemory();
    let version = 0;

    const sample = await runBenchmark('indexedDbAppend100', 5, async () => {
      const batch = Array.from({ length: 20 }, (_, i) => makeEvent(version + i));
      const result = await store.append('s1', batch, version);
      if (!result.ok) throw new Error('append conflict');
      version = result.version;
    });

    const checked = checkBudget(
      sample,
      DEFAULT_PERFORMANCE_BUDGETS.indexedDbAppend100,
    );
    expect(checked.ok, checked.reasons.join('; ')).toBe(true);
  });

  it('keeps selector noop notifications cheap', async () => {
    const store = new TableStore({ a: 1, b: 0 });
    let calls = 0;
    store.subscribeWithSelector(
      (s) => s.a,
      () => {
        calls += 1;
      },
    );

    const sample = await runBenchmark('selectorNotifyNoop', 50, () => {
      store.setState((prev) => ({ ...prev, b: prev.b + 1 }));
    });

    expect(calls).toBe(0);
    const checked = checkBudget(
      sample,
      DEFAULT_PERFORMANCE_BUDGETS.selectorNotifyNoop,
    );
    expect(checked.ok, checked.reasons.join('; ')).toBe(true);
  });
});
