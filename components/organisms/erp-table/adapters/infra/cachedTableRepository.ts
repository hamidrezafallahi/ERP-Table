// adapters/infra/cachedTableRepository.ts
import { TableRepository } from '../../application/ports/TableRepository';
import { Table } from '../../domain/entities/Table';
import { IndexedDbTableRepository } from './indexedDbTableRepository';
import { LocalTableRepository } from './localTableRepository';

export class CachedTableRepository implements TableRepository {
 constructor(
    private localRepo = new LocalTableRepository(),
    private indexedRepo = new IndexedDbTableRepository()
  ) {}

  async exists(tableId: string) {
    return this.indexedRepo.exists(tableId);
  }

  async getById(tableId: string) {
    if (await this.localRepo.exists(tableId)) {
      return this.localRepo.getById(tableId);
    }
    const table = await this.indexedRepo.getById(tableId);
    await this.localRepo.save(table);  
    return table;
  }
  async getFromDbById(tableId: string) {
    const table = await this.indexedRepo.getById(tableId);
    return table;
  }

  async save(table: Table) {
    await this.localRepo.save(table);      
    await this.indexedRepo.save(table);  
  }
async delete(tableId: string): Promise<void> {
    await this.localRepo.delete(tableId)
}
async resetTable(tableId: string): Promise<void> {
    await this.localRepo.resetTable(tableId)
}

 







}
