// adapters/infra/localTableRepository.ts

import { TableRepository } from '../../application/ports/TableRepository';
import { Table } from '../../domain/entities/Table';

export class LocalTableRepository implements TableRepository {
  private tables = new Map<string, Table>();
  private initTables = new Map<string, Table>();
  constructor(initialTables: Table[] = []) {
    initialTables.forEach(t => {
      this.tables.set(t.id.value, t);
      this.initTables.set(t.id.value, t);
    });
  }

  async exists(tableId: string): Promise<boolean> {
    return this.tables.has(tableId);
  }

  async getById(tableId: string): Promise<Table> {
    const table = this.tables.get(tableId);
    if (!table) {
      throw new Error(`Table ${tableId} not found`);
    }
    return table;
  }
  async delete(tableId: string) {
    this.tables.delete(tableId)

  }
  async resetTable(tableId: string) {
    const initTable = this.initTables.get(tableId);
    this.tables.set(tableId, initTable);
  }


  async save(table: Table): Promise<void> {
    this.tables.set(table.id.value, table);
  }

}
