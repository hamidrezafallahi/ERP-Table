// adapters/infra/indexedDbTableRepository.ts

import { TableRepository } from '../../application/ports/TableRepository';
import { ColumnSchema } from '../../bootstrap/type';
import { Cell } from '../../domain/entities/Cell';
import { Collection } from '../../domain/entities/Collection';
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

// ─── Serialization interfaces ─────────────────────────────────────────────────

interface SerializedCell {
  colId: string;
  value: unknown;
  originalValue: unknown;
  display: unknown;
}

interface SerializedRow {
  rowId: number;
  cells: SerializedCell[];
  rowState: RowStateEnum;
  visibilityCondition: Record<string, boolean>;
  collection?: string;
  rowType?: string;
  isSaveDescription: boolean;
}

interface SerializedCollection {
  name?: string;
  type?: string;
  rows: SerializedRow[];
}

interface SerializedTable {
  id: string;
  pages: string[];
  collections: SerializedCollection[];
  activeCollection?: string;
  activeDetailType?: string;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class IndexedDbTableRepository implements TableRepository {
  private dbName = 'ERP_TABLE_DB';
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDb();
  }

  private initDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onupgradeneeded = (_event: IDBVersionChangeEvent) => { };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          console.warn('DB version changed, connection closed');
        };
        resolve(db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async getDb(): Promise<IDBDatabase> {
    return this.dbPromise;
  }

  // ─── Serialization ──────────────────────────────────────────────────────────

  private serializeRows(rows: Row[]): SerializedRow[] {
     return rows.map(row => ({
      rowId: row.id.value,
      rowState: row.rowState.value,
      visibilityCondition: row.visibilityCondition,
      collection: row.collection,
      isSaveDescription: row.isSaveDescription,
      cells: Array.from(row.getCells().entries()).map(([colId, cell]) => ({
        colId,
        value: cell.getValue(),
        originalValue: cell.getOriginalValue().value,
        display: cell.getDisplay(),
      })),
    }));
  }

  /**
   * Serializes the entire collection map.
   * Each Collection becomes { name, rows[] }.
   */
  private serializeCollections(
    collectionMap: Map<string, Collection>
  ): SerializedCollection[] {
    const collections = Array.from(collectionMap.entries()).map(([name, collection]) => {
       return{
      name,
      rows: this.serializeRows(Array.from(collection.getRows().values())),
    }});
    return collections
  }

  // ─── Deserialization ────────────────────────────────────────────────────────

  private deserializeRowMap(data: SerializedRow[]): Map<number, Row> {
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

      const changeFields = new Set<string>();
      if (r.rowState === RowStateEnum.Modified) {
        r.cells.forEach(c => {
          if (c.value !== c.originalValue) changeFields.add(c.colId);
        });
      }

      rowMap.set(
        r.rowId,
        new Row(
          new RowId(r.rowId),
          cells,
          new RowState(r.rowState),
          changeFields,
          r.visibilityCondition,
          r.collection ?? r.rowType ?? 'default',
          r.isSaveDescription
        )
      );
    });

    return rowMap;
  }

  /**
   * Rebuilds the full Map<string, Collection> from persisted data.
   * If the stored data is empty/missing, seeds a default empty collection
   * so Table always has at least one entry.
   */
  private deserializeCollections(
    data: SerializedCollection[],
    activeCollection: string
  ): Map<string, Collection> {
    const collectionMap = new Map<string, Collection>();

    if (!data || data.length === 0) {
      collectionMap.set(activeCollection, new Collection(activeCollection, new Map<number, Row>(), new Map<string, ColumnSchema>));
      return collectionMap;
    }

    data.forEach(({ name, type, rows }) => {
      const collectionName = name ?? type ?? activeCollection;
      collectionMap.set(collectionName, new Collection(collectionName, this.deserializeRowMap(rows), new Map<string, ColumnSchema>));
    });

    // Ensure the active collection always has an entry even if not in stored data
    if (!collectionMap.has(activeCollection)) {
      collectionMap.set(activeCollection, new Collection(activeCollection, new Map<number, Row>(), new Map<string, ColumnSchema>));
    }

    return collectionMap;
  }

  // ─── Store management ───────────────────────────────────────────────────────

  private async ensureStore(db: IDBDatabase, storeName: string): Promise<IDBDatabase> {
    if (db.objectStoreNames.contains(storeName)) return db;

    db.close();
    const newDb = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(this.dbName, db.version + 1);
      req.onupgradeneeded = (event: IDBVersionChangeEvent) => {
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

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  async save(storeName: string, table: Table): Promise<void> {
    let db = await this.getDb();
    db = await this.ensureStore(db, storeName);
    const serialized: SerializedTable = {
      id: table.id,
      pages: [table.id],
      collections: this.serializeCollections(table.getCollections()),
      activeCollection: table.getActiveCollectionName(),
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const objectStore = tx.objectStore(storeName);
      if(!objectStore)return
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
      const req = objectStore.get(tableId) as IDBRequest<SerializedTable>;

      req.onsuccess = () => {
        const result = req.result;
        if (!result) {
          reject(new Error(`Table ${tableId} not found`));
          return;
        }
        const activeCollection = result.activeCollection ?? result.activeDetailType ?? 'default';
        resolve(
          new Table(
            tableId,
            this.deserializeCollections(result.collections, activeCollection),
            new Pagination(1, 10, 10),
            null,
            activeCollection
          )
        );
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
      req.onsuccess = () => resolve(Boolean(req.result));
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
      const getReq = objectStore.get(tableId) as IDBRequest<SerializedTable>;

      getReq.onsuccess = () => {
        if (!getReq.result) {
          reject(new Error(`Table ${tableId} not found`));
          return;
        }
        const resetTable: SerializedTable = {
          id: tableId,
          pages: [tableId],
          collections: [],          // empty — Table will seed a default collection on next load
          activeDetailType: getReq.result.activeDetailType,
        };
        const putReq = objectStore.put(resetTable);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }
}