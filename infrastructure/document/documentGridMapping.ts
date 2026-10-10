/**
 * Document-grid mapping (header + detail lines) — pure, framework-free.
 *
 * Extracted from the arianERP form host hook so the project keeps ZERO table
 * logic: the host only injects I/O (fetch, save, page state) and calls these
 * functions. Nothing here knows Redux, Next.js, or any backend URL.
 */
import type { RowInput } from '../../bootstrap/type';
import type { TableSnapShot } from '../../engine/type';
import { RowStateEnum } from '../../domain/value-objects';

/** Columns the grid owns — never sent back as detail data. */
const GRID_INTERNAL_COLUMNS = new Set(['collection', 'rowType', 'ChangeFields']);

export type SnapshotToDetailsOptions = {
  /** Server primary-key field of a detail line (sent for non-new rows when updating). */
  detailFieldKey: string;
  /** True when the document already exists (edit); false for add / copy. */
  isUpdate: boolean;
  /** Body key used when every row belongs to the default collection. Default `Details`. */
  defaultKey?: string;
  /** Name of the default collection. Default `default`. */
  defaultCollection?: string;
  /** Detail field that receives the grid row number (`index` column). Default `RowNum`. */
  rowNumberField?: string;
};

export type DetailLine = Record<string, unknown>;

/**
 * Maps a grid snapshot to the server body fragment.
 * - Rows with `RowState === 'None'` (unchanged) are skipped.
 * - Single default collection → `{ [defaultKey]: DetailLine[] }`.
 * - Any custom collection → `{ [collection]: DetailLine[] }` per collection.
 */
export function mapSnapshotToDetails(
  snapshot: TableSnapShot | null | undefined,
  options: SnapshotToDetailsOptions,
): Record<string, DetailLine[]> {
  const {
    detailFieldKey,
    isUpdate,
    defaultKey = 'Details',
    defaultCollection = 'default',
    rowNumberField = 'RowNum',
  } = options;

  const changed = (snapshot?.rows ?? []).filter(
    (row) => row.rowState !== RowStateEnum.Unchanged,
  );

  const mapped = changed.map((row) => {
    const detail: DetailLine = {
      RowState: row.rowState,
      ChangeFields: row.changeFields,
    };

    if (isUpdate && row.rowState !== RowStateEnum.Added) {
      detail[detailFieldKey] = row.id;
    }
    if (row.isSaveDescription) {
      detail.isSaveDescription = row.isSaveDescription;
    }

    for (const [col, cell] of Object.entries(row.cells ?? {})) {
      if (cell == null) continue;
      if (GRID_INTERNAL_COLUMNS.has(col)) continue;
      if (col === 'index') {
        detail[rowNumberField] = cell;
        continue;
      }
      detail[col] =
        typeof cell === 'object' && 'value' in (cell as object)
          ? (cell as { value: unknown }).value
          : cell;
    }

    return { detail, collection: row.collection || defaultCollection };
  });

  const hasCustomCollection = mapped.some(
    (r) => r.collection && r.collection !== defaultCollection,
  );
  if (!hasCustomCollection) {
    return { [defaultKey]: mapped.map((r) => r.detail) };
  }

  const byCollection: Record<string, DetailLine[]> = {};
  for (const r of mapped) {
    (byCollection[r.collection] ??= []).push(r.detail);
  }
  return byCollection;
}

export type DetailsToRowInputsOptions = {
  /** Server primary-key field of a detail line. */
  detailFieldKey: string;
  /** Grid collection the rows belong to. */
  collection: string;
  /** Copy-from-document: clear the PK and mark every row as new. */
  isCopy?: boolean;
  /** Generates a client row id for copied rows. Default: random integer. */
  newRowId?: () => number;
};

/**
 * Maps server detail lines to grid `RowInput`s (initial seed).
 * Copy mode strips the primary key and marks lines `Added`.
 */
export function mapDetailsToRowInputs(
  items: readonly DetailLine[],
  options: DetailsToRowInputsOptions,
): RowInput[] {
  const {
    detailFieldKey,
    collection,
    isCopy = false,
    newRowId = () => Math.floor(Math.random() * 100000),
  } = options;

  return items.map((item) => {
    if (isCopy) {
      const rest = { ...item };
      delete rest[detailFieldKey];
      return {
        id: newRowId(),
        values: {
          ...rest,
          [detailFieldKey]: undefined,
          RowState: RowStateEnum.Added,
          collection,
        },
      };
    }
    return {
      id: item[detailFieldKey] as number,
      values: { ...item, collection },
    };
  });
}

/** One header (form) field as the host keeps it. */
export type DocumentHeaderField = {
  name: string;
  value?: unknown;
  originalValue?: unknown;
  type?: string;
  caption?: string;
  [key: string]: unknown;
};

export type BuildDocumentPayloadOptions = {
  headerFields: readonly DocumentHeaderField[];
  /** Server primary-key field of the header. */
  headerFieldKey: string;
  /** Existing document id (0 / undefined for a new document). */
  recordId?: number;
  /** Result of {@link mapSnapshotToDetails}. */
  details: Record<string, DetailLine[]>;
  /** Header fields that must be sent as numbers even when typed as text. */
  numericFieldNames?: readonly string[];
};

/**
 * Builds the save body: header values (empty string → null, numeric coercion),
 * `ChangeFields` of the header on update, and the detail lines.
 */
export function buildDocumentPayload(
  options: BuildDocumentPayloadOptions,
): Record<string, unknown> {
  const {
    headerFields,
    headerFieldKey,
    recordId = 0,
    details,
    numericFieldNames = [],
  } = options;
  const numeric = new Set<string>([headerFieldKey, ...numericFieldNames]);

  const formValues = Object.fromEntries(
    headerFields.map((field) => {
      let value = field.value;
      if (value === '') value = null;
      if (value != null && (field.type === 'number' || numeric.has(field.name))) {
        const n = Number(value);
        value = Number.isNaN(n) ? null : n;
      }
      return [field.name, value];
    }),
  );

  const isUpdate = recordId !== 0 && recordId != null;
  const changeFields = headerFields
    .filter((field) => field.value !== field.originalValue)
    .map((field) => field.name);

  return {
    ...formValues,
    ChangeFields: isUpdate ? changeFields : undefined,
    ...details,
    [headerFieldKey]: isUpdate ? recordId : undefined,
  };
}

/**
 * Re-seeds header fields from the server record.
 * Copy mode clears identity fields (PK + auto-generated numbers).
 */
export function mapServerHeaderToFields(
  fields: readonly DocumentHeaderField[],
  serverRecord: Record<string, unknown> | null | undefined,
  options: {
    headerFieldKey: string;
    recordId: number;
    isCopy?: boolean;
    /** Header fields cleared on copy besides the PK. Default none. */
    copyResetFields?: readonly string[];
    /** Values already edited locally (take precedence over the server). */
    storedFields?: readonly DocumentHeaderField[];
    /** Field caption that marks the primary-key field (`MainIdField`). */
    mainIdCaption?: string;
  },
): DocumentHeaderField[] {
  const {
    headerFieldKey,
    recordId,
    isCopy = false,
    copyResetFields = [],
    storedFields,
    mainIdCaption = 'MainIdField',
  } = options;
  const reset = new Set<string>([headerFieldKey, ...copyResetFields]);

  const mapped: DocumentHeaderField[] = fields.map((field) => {
    const isIdentity =
      isCopy && (reset.has(field.name) || field.caption === mainIdCaption);
    const stored = storedFields?.find((f) => f.name === field.name)?.value;
    const fromServer = serverRecord
      ? (serverRecord[field.name] ?? undefined)
      : undefined;
    const current = stored !== undefined ? stored : fromServer;
    return {
      ...field,
      value: isIdentity ? null : current,
      originalValue: isIdentity ? null : fromServer,
      isTitleField: field.name === headerFieldKey,
    };
  });

  mapped.push({
    name: headerFieldKey,
    value: isCopy ? null : recordId,
    originalValue: isCopy ? null : recordId,
    type: 'hidden',
  });
  return mapped;
}
