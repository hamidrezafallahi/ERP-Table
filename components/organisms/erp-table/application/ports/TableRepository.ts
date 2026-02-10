//application/ports

import { Table } from '../../domain/entities/Table';

export interface TableRepository {
  getById(store: string, tableKey: string): Promise<Table>;
  save(store: string, table: Table): Promise<void>;
  delete(store: string, tableKey: string): Promise<void>;
  resetTable(store: string, tableKey: string): Promise<void>;
  exists(store: string, tableKey: string): Promise<boolean>;
  getFromDbById?(store: string, tableKey: string): Promise<Table>;
}


