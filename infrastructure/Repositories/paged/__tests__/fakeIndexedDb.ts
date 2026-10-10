/**
 * Cursor-capable in-memory IndexedDB fake (request/callback semantics).
 * Importing this module installs `indexedDB` / `IDBKeyRange` on globalThis.
 */

/* ── Fake IndexedDB (request/callback semantics, cursor-capable) ─────────── */

type CmpKey = unknown;
type FakeRecord = Record<string, unknown>;

function cmpKeys(a: CmpKey, b: CmpKey): number {
  const A = Array.isArray(a) ? a : [a];
  const B = Array.isArray(b) ? b : [b];
  for (let i = 0; i < Math.min(A.length, B.length); i++) {
    if (A[i] === B[i]) continue;
    return (A[i] as string) < (B[i] as string) ? -1 : 1;
  }
  return A.length - B.length;
}

class FakeKeyRange {
  constructor(
    public lower: CmpKey,
    public upper: CmpKey,
    public lowerOpen: boolean,
    public upperOpen: boolean,
  ) {}
  static only(v: CmpKey): FakeKeyRange {
    return new FakeKeyRange(v, v, false, false);
  }
  static bound(l: CmpKey, u: CmpKey, lo = false, uo = false): FakeKeyRange {
    return new FakeKeyRange(l, u, lo, uo);
  }
  includes(k: CmpKey): boolean {
    if (this.lower !== undefined) {
      const c = cmpKeys(k, this.lower);
      if (this.lowerOpen ? c <= 0 : c < 0) return false;
    }
    if (this.upper !== undefined) {
      const c = cmpKeys(k, this.upper);
      if (this.upperOpen ? c >= 0 : c > 0) return false;
    }
    return true;
  }
}

class FakeRequest<T = unknown> {
  result: T | null = null;
  onsuccess: ((e?: unknown) => void) | null = null;
  onerror: ((e?: unknown) => void) | null = null;
  constructor(getResult?: () => T) {
    if (getResult) {
      queueMicrotask(() => {
        this.result = getResult();
        this.onsuccess?.({ target: this });
      });
    }
  }
}

interface CursorEntry {
  key: CmpKey;
  value: FakeRecord;
}

class FakeCursor {
  constructor(
    private entries: CursorEntry[],
    public pos: number,
    private req: FakeCursorRequest,
    private store: FakeObjectStore,
  ) {}
  get key(): CmpKey {
    return this.entries[this.pos].key;
  }
  get value(): FakeRecord {
    return this.entries[this.pos].value;
  }
  delete(): void {
    this.store.deleteRaw(this.entries[this.pos].value['id']);
  }
  update(v: FakeRecord): void {
    this.store.records.set(JSON.stringify(v['id']), v);
  }
  continue(): void {
    this.pos += 1;
    this.req.advance();
  }
}

class FakeCursorRequest {
  result: FakeCursor | null = null;
  onsuccess: ((e?: unknown) => void) | null = null;
  onerror: ((e?: unknown) => void) | null = null;
  constructor(private source: () => FakeCursor | null) {}
  start(): void {
    queueMicrotask(() => this.fire());
  }
  advance(): void {
    queueMicrotask(() => this.fire());
  }
  private fire(): void {
    this.result = this.source();
    this.onsuccess?.({ target: this });
  }
}

class FakeIndex {
  constructor(
    private store: FakeObjectStore,
    private keyPath: string[],
  ) {}
  private keyOf(rec: FakeRecord): CmpKey {
    const vals = this.keyPath.map(k => rec[k]);
    return vals.length === 1 ? vals[0] : vals;
  }
  getAll(range?: FakeKeyRange): FakeRequest<FakeRecord[]> {
    return new FakeRequest(() =>
      [...this.store.records.values()].filter(
        (rec) => !range || (range as FakeKeyRange).includes(this.keyOf(rec)),
      ),
    );
  }
  openCursor(range?: FakeKeyRange): FakeCursorRequest {
    const entries = [...this.store.records.values()]
      .map(rec => ({ key: this.keyOf(rec), value: rec }))
      .filter(e => !range || (range as FakeKeyRange).includes(e.key))
      .sort((a, b) => cmpKeys(a.key, b.key));
    return makeCursorRequest(entries, this.store);
  }
}

function makeCursorRequest(entries: CursorEntry[], store: FakeObjectStore): FakeCursorRequest {
  const req = new FakeCursorRequest(() => (cursor.pos < entries.length ? cursor : null));
  const cursor = new FakeCursor(entries, 0, req, store);
  req.start();
  return req;
}

class FakeObjectStore {
  records = new Map<string, FakeRecord>();
  indexes = new Map<string, FakeIndex>();
  constructor(public name: string) {}
  createIndex(name: string, keyPath: string | string[]): void {
    this.indexes.set(name, new FakeIndex(this, Array.isArray(keyPath) ? keyPath : [keyPath]));
  }
  index(name: string): FakeIndex {
    return this.indexes.get(name) as FakeIndex;
  }
  get indexNames(): { contains(n: string): boolean } {
    return { contains: (n: string) => this.indexes.has(n) };
  }
  put(rec: FakeRecord): FakeRequest {
    this.records.set(JSON.stringify(rec['id']), rec);
    return new FakeRequest();
  }
  delete(key: unknown): FakeRequest {
    this.records.delete(JSON.stringify(key));
    return new FakeRequest();
  }
  deleteRaw(key: unknown): void {
    this.records.delete(JSON.stringify(key));
  }
  get(key: unknown): FakeRequest {
    return new FakeRequest(() => this.records.get(JSON.stringify(key)));
  }
  getAll(): FakeRequest<FakeRecord[]> {
    return new FakeRequest(() => [...this.records.values()]);
  }
  openCursor(range?: FakeKeyRange): FakeCursorRequest {
    const entries = [...this.records.entries()]
      .map(([k, v]) => ({ key: JSON.parse(k) as CmpKey, value: v }))
      .filter(e => !range || (range as FakeKeyRange).includes(e.key))
      .sort((a, b) => cmpKeys(a.key, b.key));
    return makeCursorRequest(entries, this);
  }
}

class FakeTransaction {
  oncomplete: ((e?: unknown) => void) | null = null;
  onerror: ((e?: unknown) => void) | null = null;
  onabort: ((e?: unknown) => void) | null = null;
  constructor(private db: FakeDatabase) {
    // Requests complete in microtasks; a macrotask fires after all of them.
    setTimeout(() => this.oncomplete?.({}), 0);
    void this.db;
  }
  objectStore(name: string): FakeObjectStore {
    return this.db.stores.get(name) as FakeObjectStore;
  }
}

class FakeDatabase {
  stores = new Map<string, FakeObjectStore>();
  version = 1;
  onversionchange: (() => void) | null = null;
  get objectStoreNames(): { contains(n: string): boolean } {
    return { contains: (n: string) => this.stores.has(n) };
  }
  createObjectStore(name: string): FakeObjectStore {
    const s = new FakeObjectStore(name);
    this.stores.set(name, s);
    return s;
  }
  transaction(_names: string | string[], _mode?: string): FakeTransaction {
    return new FakeTransaction(this);
  }
  close(): void {
    /* nothing to close */
  }
}

/* ── Install globals BEFORE repos are instantiated ────────────────────────── */

export const fakeDb = new FakeDatabase();
const g = globalThis as Record<string, unknown>;
g['IDBKeyRange'] = FakeKeyRange;
g['indexedDB'] = {
  open(_name: string, version?: number): FakeRequest<FakeDatabase> {
    const req = new FakeRequest<FakeDatabase>() as FakeRequest<FakeDatabase> & {
      onupgradeneeded?: (e: unknown) => void;
    };
    queueMicrotask(() => {
      if (version !== undefined && version > fakeDb.version) {
        // Run the schema upgrade (createObjectStore / createIndex) first.
        fakeDb.version = version;
        req.onupgradeneeded?.({ target: { result: fakeDb } });
      }
      req.result = fakeDb;
      req.onsuccess?.({ target: req });
    });
    return req;
  },
};

