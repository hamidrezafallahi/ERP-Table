// adapters/infra/cachedTableRepository.ts
import { TableRepository } from '../../application/ports/TableRepository';
import { Table } from '../../domain/entities/Table';
import { IndexedDbTableRepository } from './indexedDbTableRepository';
import { LocalTableRepository } from './localTableRepository';

export class CachedTableRepository implements TableRepository {
  private localRepo: LocalTableRepository;
  private indexedRepo: IndexedDbTableRepository;

  constructor() {
    this.localRepo = new LocalTableRepository();
    this.indexedRepo = new IndexedDbTableRepository();
  }

  async getById(store: string, tableKey: string): Promise<Table> {
    if (await this.localRepo.exists(store, tableKey)) {
      return this.localRepo.getById(store, tableKey);
    }
    const table = await this.indexedRepo.getById(store, tableKey);
    await this.localRepo.save(store, table);
    return table;
  }

  async save(store: string, table: Table): Promise<void> {
    await this.localRepo.save(store, table);
    await this.indexedRepo.save(store, table);
  }

  async delete(store: string, tableKey: string): Promise<void> {
    await this.localRepo.delete(store, tableKey);
    await this.indexedRepo.delete(store, tableKey);
  }

  async resetTable(store: string, tableKey: string): Promise<void> {
    await this.localRepo.resetTable(store, tableKey);
    await this.indexedRepo.resetTable(store, tableKey);
  }

  async exists(store: string, tableKey: string): Promise<boolean> {
    return this.indexedRepo.exists(store, tableKey);
  }
}

