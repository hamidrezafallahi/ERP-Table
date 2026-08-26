/**
 * Minimal async key-value backend so IndexedDbEventStore can run in Node tests
 * without a real IndexedDB, and in browsers via an IDB adapter.
 */
export interface KvStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  getAll<T = unknown>(): Promise<T[]>;
  clear(): Promise<void>;
}

export interface KvDatabase {
  objectStore(name: string): KvStore;
}

export class MemoryKvStore implements KvStore {
  private data = new Map<string, unknown>();

  async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }

  async put(key: string, value: unknown): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.data.keys());
  }

  async getAll<T = unknown>(): Promise<T[]> {
    return Array.from(this.data.values()) as T[];
  }

  async clear(): Promise<void> {
    this.data.clear();
  }
}

export class MemoryKvDatabase implements KvDatabase {
  private stores = new Map<string, MemoryKvStore>();

  objectStore(name: string): KvStore {
    let store = this.stores.get(name);
    if (!store) {
      store = new MemoryKvStore();
      this.stores.set(name, store);
    }
    return store;
  }
}

/**
 * Browser IndexedDB adapter. Opens (or creates) a DB with the given object stores.
 * Falls back callers should use MemoryKvDatabase in Node/tests.
 */
export async function openIndexedDbDatabase(
  dbName: string,
  storeNames: string[],
  version = 1,
): Promise<KvDatabase> {
  if (typeof indexedDB === 'undefined') {
    throw new Error('indexedDB is not available in this environment');
  }

  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onerror = () => reject(request.error ?? new Error('indexedDB.open failed'));
    request.onupgradeneeded = () => {
      const database = request.result;
      for (const name of storeNames) {
        if (!database.objectStoreNames.contains(name)) {
          database.createObjectStore(name);
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
  });

  return {
    objectStore(name: string): KvStore {
      return {
        async get<T = unknown>(key: string): Promise<T | undefined> {
          return run(db, name, 'readonly', (store) => store.get(key)) as Promise<T | undefined>;
        },
        async put(key: string, value: unknown): Promise<void> {
          await run(db, name, 'readwrite', (store) => store.put(value, key));
        },
        async delete(key: string): Promise<void> {
          await run(db, name, 'readwrite', (store) => store.delete(key));
        },
        async getAllKeys(): Promise<string[]> {
          const keys = await run(db, name, 'readonly', (store) => store.getAllKeys());
          return (keys as IDBValidKey[]).map(String);
        },
        async getAll<T = unknown>(): Promise<T[]> {
          return run(db, name, 'readonly', (store) => store.getAll()) as Promise<T[]>;
        },
        async clear(): Promise<void> {
          await run(db, name, 'readwrite', (store) => store.clear());
        },
      };
    },
  };
}

function run<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  op: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = op(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IDB request failed'));
  });
}
