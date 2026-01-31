//adapters/infra/indexedDbTableRepository.ts
import { TableRepository } from '../../application/ports/TableRepository';
import { Cell } from '../../domain/entities/Cell';
import { Row } from '../../domain/entities/Row';
import { Table } from '../../domain/entities/Table';
import {
  CellValue,
  ColumnId,
  RowId,
  RowState,
  RowStateEnum,
  TableId,
} from '../../domain/value-objects';

interface SerializedCell {
  colId: string;
  value: any;
  originalValue: any;
  display: any;
}

interface SerializedRow {
  rowId: number;
  cells: SerializedCell[];
  rowState: RowStateEnum;
}

interface SerializedTable {
  id: string;
  rows: SerializedRow[];
}

export class IndexedDbTableRepository implements TableRepository {
  private dbName = 'ERP_TABLE_DB';
  private storeName = 'tables';
  private dbReady: Promise<void>;

  constructor() {
    this.dbReady = this.initDb();
  }

  private initDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getDb(): Promise<IDBDatabase> {
    await this.dbReady;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private serializeRows(rows: Row[]): SerializedRow[] {
    return rows.map(row => ({
      rowId: row.id.value,
      rowState: row.rowState.value,
      cells: Array.from(row.getCells().entries()).map(([colId, cell]) => ({
        colId,
        value: cell.getValue().value,
        originalValue: cell.getOriginalValue().value,
        display: cell.getDisplay().value,
      }))
    }));
  }

  private deserializeRows(data: SerializedRow[]): Map<number, Row> {
    const rowMap = new Map<number, Row>();
    data.forEach(r => {
      const cells = new Map<string, Cell>();
      r.cells.forEach(c => {
        cells.set(c.colId, new Cell(
          new RowId(r.rowId),
          new ColumnId(c.colId),
          new CellValue(c.value),
          new CellValue(c.originalValue),
          new CellValue(c.display)
        ));
      });
      rowMap.set(r.rowId, new Row(new RowId(r.rowId), cells, new RowState(r.rowState), new Set()));
    });
    return rowMap;
  }

  async save(table: Table): Promise<void> {
    const db = await this.getDb();
    const serialized: SerializedTable = {
      id: table.id.value,
      rows: this.serializeRows(table.getRows()),
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put(serialized);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getById(tableId: string): Promise<Table> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(tableId);
      req.onsuccess = () => {
        if (!req.result) reject(new Error(`Table ${tableId} not found`));
        else resolve(new Table(new TableId(tableId), this.deserializeRows(req.result.rows), new Map()));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async exists(tableId: string): Promise<boolean> {
    const db = await this.getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(tableId);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  }
async delete(tableId: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(tableId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}
async resetTable(tableId: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.get(tableId);
        req.onsuccess = () => {
            if (!req.result) {
                reject(new Error(`Table ${tableId} not found`));
                return;
            }
            const resetTable: SerializedTable = {
                id: tableId,
                rows: []  
            };
            const putReq = store.put(resetTable);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
        
        req.onerror = () => reject(req.error);
    });
}
}
