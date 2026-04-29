// adapters/infra/indexedDbTableRepository.ts

import { TableRepository } from '../../application/ports/TableRepository';
import { Cell } from '../../domain/entities/Cell';
import { Row } from '../../domain/entities/Row';
import { Table } from '../../domain/entities/Table';
import {
  CellValue,
  ColumnId,
  Pagination,
  RowId,
  RowState,
  RowStateEnum,
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
  moreDetails: unknown;
  visibilityCondition: Record<string, boolean>

}

interface SerializedTable {
  id: string | null;
  pages: string[];
  rows: SerializedRow[];
}

export class IndexedDbTableRepository implements TableRepository {
  private dbName = 'ERP_TABLE_DB';
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDb();
  }

  private initDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onupgradeneeded = (event) => {
       };

      request.onsuccess = () => {
        const db = request.result;

        db.onversionchange = () => {
          db.close();
          console.warn("DB version changed, connection closed");
        };

        resolve(db);
      };
      request.onerror = () => reject(request.error)
    });
  }

  private async getDb(): Promise<IDBDatabase> {
    return this.dbPromise;
  }

  private serializeRows(rows: Row[]): SerializedRow[] {
    return rows.map(row => ({
      rowId: row.id.value,
      rowState: row.rowState.value,
      moreDetails: row.moreDetails,
      visibilityCondition: row.visibilityCondition,
      cells: Array.from(row.getCells().entries()).map(([colId, cell]) => ({
        colId,
        value: cell.getValue().value,
        originalValue: cell.getOriginalValue().value,
        display: cell.getDisplay().value,
      })),
    }));
  }

  private deserializeRows(data: SerializedRow[]): Map<number, Row> {
    const rowMap = new Map<number, Row>();
     data.forEach(r => {
      const cells = new Map<string, Cell>();
      r.cells.forEach(c => {
        cells.set(
          c.colId,
          new Cell(
            new RowId(r.rowId),
            new ColumnId(c.colId),
            new CellValue(c.value),
            new CellValue(c.originalValue),
            new CellValue(c.display)
          )
        );
      });
       const changeFields: Set<string> = new Set()
       if (r.rowState == "Update") {
        r.cells.filter(c => c.value !== c.originalValue).map(c => changeFields.add(c.colId))
      }
      rowMap.set(
        r.rowId,
        new Row(new RowId(r.rowId), cells, new RowState(r.rowState), changeFields, r.moreDetails, r.visibilityCondition)
      );
    });
    return rowMap;
  }

  private async ensureStore(db: IDBDatabase, storeName: string): Promise<IDBDatabase> {
    if (db.objectStoreNames.contains(storeName)) return db;

    db.close();

    const newDb = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(this.dbName, db.version + 1);

      req.onupgradeneeded = (event) => {
        const upgradedDb = (event.target as IDBOpenDBRequest).result;
        if (!upgradedDb.objectStoreNames.contains(storeName)) {
          upgradedDb.createObjectStore(storeName, { keyPath: 'id' });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

     this.dbPromise = Promise.resolve(newDb);

    return newDb;
  }


  async save(storeName: string, table: Table): Promise<void> {
    let db = await this.getDb();
    db = await this.ensureStore(db, storeName);
    const serialized: SerializedTable = {
      id: table.id,
      pages: [table.id],
      rows: this.serializeRows(table.getRows()),
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const objectStore = tx.objectStore(storeName);
      const req = objectStore.put(serialized);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getById(storeName: string, tableId: string): Promise<Table> {
    const db = await this.getDb();
    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`Store ${storeName} not found`);
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const objectStore = tx.objectStore(storeName);
      const req = objectStore.get(tableId);
      req.onsuccess = () => {
        if (!req.result) {
          reject(new Error(`Table ${tableId} not found`));
          return;
        }
        resolve(new Table(tableId, this.deserializeRows(req.result.rows), new Map(), new Pagination(1, 10, 10)));
      };
      req.onerror = () => reject(req.error);
    });
  }
  async exists(storeName: string, tableId: string): Promise<boolean> {
    if (!tableId) return false;
    const db = await this.getDb();
    if (!db.objectStoreNames.contains(storeName)) return false;
    return new Promise(resolve => {
      const tx = db.transaction(storeName, 'readonly');
      const objectStore = tx.objectStore(storeName);
      const req = objectStore.get(tableId);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  }

  async delete(storeName: string, tableId: string): Promise<void> {
    const db = await this.getDb();
    if (!db.objectStoreNames.contains(storeName)) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const objectStore = tx.objectStore(storeName);
      const req = objectStore.delete(tableId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
  async resetTable(storeName: string, tableId: string): Promise<void> {
    const db = await this.getDb();
    if (!db.objectStoreNames.contains(storeName)) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const objectStore = tx.objectStore(storeName);
      const getReq = objectStore.get(tableId);
      getReq.onsuccess = () => {
        if (!getReq.result) {
          reject(new Error(`Table ${tableId} not found`));
          return;
        }
        const resetTable: SerializedTable = { id: tableId, pages: [tableId], rows: [] };
        const putReq = objectStore.put(resetTable);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }
}
