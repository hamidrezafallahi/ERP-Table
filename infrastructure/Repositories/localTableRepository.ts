// adapters/infra/localTableRepository.ts

import { TableRepository } from '../../application/ports/TableRepository';
import { Table } from '../../domain/entities/Table';

export class LocalTableRepository implements TableRepository {
  private tables = new Map<string, Table>();
  private initTables = new Map<string, Table>();

  constructor(initialTables: Table[] = []) {
    initialTables.forEach(t => {
      this.tables.set(t.id, t.clone());
      this.initTables.set(t.id, t.clone()); 
    });
  }

  async exists(_store: string, tableKey: string): Promise<boolean> {
    return this.tables.has(tableKey);
  }

  async getById(_store: string, tableKey: string): Promise<Table> {
    const table = this.tables.get(tableKey);
    if (!table) throw new Error(`Table ${tableKey} not found`);
    return table;
  }

  async save(_store: string, table: Table): Promise<void> {
    this.tables.set(table.id, table);
  }

  async delete(_store: string, tableKey: string): Promise<void> {
    this.tables.delete(tableKey);
  }

  async resetTable(_store: string, tableKey: string): Promise<void> {
    const initTable = this.initTables.get(tableKey);
    if (initTable) this.tables.set(tableKey, initTable.clone()); // ← fresh clone each reset
  }
}