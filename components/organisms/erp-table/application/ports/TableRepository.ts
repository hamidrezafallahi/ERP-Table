//application/ports

import { Table } from '../../domain/entities/Table';

export type LoadMoreParams = {
  offset?: number;
  limit?: number;
  cursor?: string;
  startIndex?: number;
  endIndex?: number;
  page?: number;
  pageSize?: number;
};

export interface TableRepository {
  getById(tableId: string): Promise<Table>;
  save(table: Table): Promise<void>;
  delete(tableId: string): Promise<void>;
  resetTable(tableId: string): Promise<void>;
  exists(tableId: string): Promise<boolean>;
  getFromDbById?(tableId: string): Promise<Table>;
}

export interface PaginatedTableRepository extends TableRepository {
  loadMoreRows(
    params: LoadMoreParams
  ): Promise<Table>;}

