import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import type { ValidationCallbackResult } from '../type';

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

class SilentAuditLogger implements AuditLogger {
  log(): void {}
  error(): void {}
  warn(): void {}
  info(): void {}
}

function waitForValidation(
  engine: { validation: (cb: (result: ValidationCallbackResult) => void) => void },
): Promise<ValidationCallbackResult> {
  return new Promise((resolve) => {
    engine.validation(resolve);
  });
}

describe('PR-47 asyncValidator', () => {
  it('validation() stays synchronous when no column has asyncValidator', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-av-sync',
      tableKey: 'table-av-sync',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
          rules: [{ required: true, message: 'required-name' }],
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { name: '' } }],
    });

    let called = false;
    result.engine.validation((res) => {
      called = true;
      expect(res.valid).toBe(false);
      expect([...res.errors!.values()].some((e) => e.message === 'required-name')).toBe(
        true,
      );
    });
    expect(called).toBe(true);
  });

  it('awaited asyncValidator reject populates the CellError map', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-av-reject',
      tableKey: 'table-av-reject',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
          rules: [
            {
              asyncValidator: async (_rule, value) => {
                if (value === 'taken') {
                  return Promise.reject(new Error('duplicate'));
                }
              },
            },
          ],
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { name: 'taken' } }],
    });

    const res = await waitForValidation(result.engine);
    expect(res.valid).toBe(false);
    expect([...res.errors!.values()].map((e) => e.message)).toContain('duplicate');
    expect(res.errors!.size).toBeGreaterThan(0);
  });

  it('awaited asyncValidator resolve leaves the cell valid', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-av-ok',
      tableKey: 'table-av-ok',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
          rules: [
            {
              asyncValidator: async () => undefined,
            },
          ],
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { name: 'ok' } }],
    });

    const res = await waitForValidation(result.engine);
    expect(res.valid).toBe(true);
    expect(res.errors?.size ?? 0).toBe(0);
  });

  it('isValidCell surfaces async errors after the promise settles', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-av-cell',
      tableKey: 'table-av-cell',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
          rules: [
            {
              message: 'async-fail',
              asyncValidator: async () => {
                await Promise.resolve();
                throw new Error('nope');
              },
            },
          ],
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { name: 'x' } }],
    });

    const first = result.engine.isValidCell(1, 'name');
    expect(first.isValid).toBe(true);

    await vi.waitFor(() => {
      const next = result.engine.isValidCell(1, 'name');
      expect(next.isValid).toBe(false);
      expect(next.cellError.message).toBe('async-fail');
    });
  });
});
