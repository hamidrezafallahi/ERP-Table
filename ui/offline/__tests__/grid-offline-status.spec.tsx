/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createGrid } from '../../../bootstrap';
import { IndexedDbEventStore } from '../../../infrastructure/eventStore/IndexedDbEventStore';
import type { TableRepository } from '../../../application/ports/TableRepository';
import type { Table } from '../../../domain/entities/Table';
import type { ConnectivitySource } from '../../../application/offline/OfflineStatus';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import { themeDefault } from '../../theme';
import { GridOfflineStatus } from '../GridOfflineStatus';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

class MemoryTableRepository implements TableRepository {
  private tables = new Map<string, Table>();
  private key(store: string, tableKey: string) {
    return `${store}:${tableKey}`;
  }
  async getById(store: string, tableKey: string) {
    const table = this.tables.get(this.key(store, tableKey));
    if (!table) throw new Error('missing');
    return table;
  }
  async save(store: string, table: Table) {
    this.tables.set(this.key(store, table.id), table);
  }
  async delete(store: string, tableKey: string) {
    this.tables.delete(this.key(store, tableKey));
  }
  async resetTable(store: string, tableKey: string) {
    this.tables.delete(this.key(store, tableKey));
  }
  async exists(store: string, tableKey: string) {
    return this.tables.has(this.key(store, tableKey));
  }
}

function makeConnectivity(initial = true): ConnectivitySource & {
  setOnline: (v: boolean) => void;
} {
  let online = initial;
  const listeners = new Set<(v: boolean) => void>();
  return {
    getOnline: () => online,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setOnline(v) {
      online = v;
      for (const listener of listeners) listener(v);
    },
  };
}

describe('PR-137 GridOfflineStatus + persistence recovery', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows offline badge and pending count after a cell edit', async () => {
    const connectivity = makeConnectivity(false);
    const eventStore = IndexedDbEventStore.inMemory();
    const grid = createGrid({
      store: 'offline-ui',
      tableKey: 'offline-ui-table',
      actor: { userId: 'u1', roles: ['admin'] },
      repo: new MemoryTableRepository(),
      eventStore,
      connectivity,
      columnDefs: [{ field: 'name', headerName: 'Name', editable: true }],
      rowData: [{ id: '1', name: 'alpha' }],
      getRowId: (r: { id: string }) => r.id,
    });
    await grid.ready;
    expect(grid.controller.getConnectivity()).toBe('offline');

    const rowId = grid.controller.getAllRows()![0]!.id.value;
    await act(async () => {
      await grid.controller.dispatch({
        type: 'UI_CELL_CHANGE',
        rowId,
        columnId: 'name',
        value: 'beta',
      });
    });

    const { container } = render(
      <ERPTableHostProvider locale="en" theme={themeDefault}>
        <GridOfflineStatus controller={grid.controller} />
      </ERPTableHostProvider>,
    );

    await waitFor(() => {
      expect(
        container
          .querySelector('[data-pdg-offline-status]')
          ?.getAttribute('data-pdg-connectivity'),
      ).toBe('offline');
      expect(
        container
          .querySelector('[data-pdg-offline-pending-count]')
          ?.getAttribute('data-pdg-offline-pending-count'),
      ).not.toBe('0');
      expect(container.textContent).toMatch(/Offline/i);
      expect(container.textContent).toMatch(/unsaved changes/i);
    });

    await act(async () => {
      connectivity.setOnline(true);
    });
    await waitFor(() => {
      expect(grid.controller.getConnectivity()).toBe('online');
      expect(
        container
          .querySelector('[data-pdg-offline-status]')
          ?.getAttribute('data-pdg-connectivity'),
      ).toBe('online');
    });
  });

  it('recovers cell value after remount from shared repo + event store', async () => {
    const repo = new MemoryTableRepository();
    const eventStore = IndexedDbEventStore.inMemory();
    const shared = {
      store: 'offline-recover',
      tableKey: 'offline-recover-table',
      actor: { userId: 'u1', roles: ['admin'] as string[] },
      repo,
      eventStore,
      columnDefs: [{ field: 'name', headerName: 'Name', editable: true }],
      getRowId: (r: { id: string }) => r.id,
    };

    const first = createGrid({
      ...shared,
      rowData: [{ id: '1', name: 'alpha' }],
    });
    await first.ready;
    const rowId = first.controller.getAllRows()![0]!.id.value;
    await first.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: shared.store,
      tableKey: shared.tableKey,
      rowId,
      columnId: 'name',
      newValue: 'persisted',
    });
    expect(first.table.getRow(rowId)?.getCell('name')?.getValue()).toBe(
      'persisted',
    );

    const second = createGrid({
      ...shared,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text' as const,
          fieldCollection: 'default',
          visibility: { kind: 'always' as const },
        },
      ],
    });
    await second.ready;
    expect(second.table.getRow(rowId)?.getCell('name')?.getValue()).toBe(
      'persisted',
    );
    expect(second.api.getPendingChangeCount()).toBeGreaterThan(0);
  });
});
