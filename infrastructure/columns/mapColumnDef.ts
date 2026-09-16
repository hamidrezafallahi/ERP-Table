import type { ColumnDef, ColumnDefBridge } from '../../domain/types/ColumnDef';
import type { ColDefOrGroup } from '../../domain/types/ColumnGroupDef';
import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import { flattenColDefOrGroup } from './flattenColumnDefs';

const DEFAULT_FIELD_TYPE: ColumnSchema['fieldType'] = 'text';

/** Resolve the persisted column id (`colId` wins, then `field`). */
export function columnDefFieldName<TRow, TValue = unknown>(
  def: ColumnDef<TRow, TValue>,
): string {
  if (typeof def.colId === 'string' && def.colId.length > 0) return def.colId;
  const field = def.field as string | undefined;
  if (typeof field === 'string' && field.length > 0) return field;
  throw new Error('ColumnDef requires colId or field');
}

function pickBridge<TRow, TValue>(def: ColumnDef<TRow, TValue>): ColumnDefBridge | undefined {
  const bridge: ColumnDefBridge = {};
  const fieldName = columnDefFieldName(def);
  if (typeof def.field === 'string' && def.field !== fieldName) {
    bridge.field = def.field;
  }
  if (typeof def.colId === 'string' && def.colId !== fieldName) {
    bridge.colId = def.colId;
  } else if (typeof def.colId === 'string' && typeof def.field === 'string') {
    // both set and equal fieldName — omit
  }
  if (def.valueGetter) {
    bridge.valueGetter = def.valueGetter as ColumnDefBridge['valueGetter'];
  }
  if (def.valueSetter) {
    bridge.valueSetter = def.valueSetter as ColumnDefBridge['valueSetter'];
  }
  if (def.valueFormatter) {
    bridge.valueFormatter = def.valueFormatter as ColumnDefBridge['valueFormatter'];
  }
  if (def.comparator) {
    bridge.comparator = def.comparator as ColumnDefBridge['comparator'];
  }
  if (typeof def.editable === 'function') {
    bridge.editableWhen = def.editable as ColumnDefBridge['editableWhen'];
  }
  if (def.width !== undefined) bridge.width = def.width;
  if (def.flex !== undefined) bridge.flex = def.flex;
  if (def.pinned !== undefined) bridge.pinned = def.pinned;
  if (def.sortable !== undefined) bridge.sortable = def.sortable;
  if (def.filter !== undefined) bridge.filter = def.filter;
  if (def.aggFunc !== undefined) {
    bridge.aggFunc = def.aggFunc as ColumnDefBridge['aggFunc'];
  }
  return Object.keys(bridge).length > 0 ? bridge : undefined;
}

function emptySchema<TRow, TValue>(def: ColumnDef<TRow, TValue>): ColumnSchema {
  const fieldName = columnDefFieldName(def);
  return {
    fieldName,
    fieldCaption: def.headerName ?? fieldName,
    fieldType: def.type ?? DEFAULT_FIELD_TYPE,
  visibility: { kind: 'always' },
};
}

/**
 * Generic `ColumnDef` → legacy/ERP `ColumnSchema`.
 * Unmapped ColumnDef fields are stored on `schema.columnDef` for the reverse map.
 */
export function toColumnSchema<TRow, TValue = unknown>(
  def: ColumnDef<TRow, TValue>,
): ColumnSchema {
  const fieldName = columnDefFieldName(def);
  const base: ColumnSchema = def.columnSchema
    ? { ...def.columnSchema }
    : emptySchema(def);

  const next: ColumnSchema = {
    ...base,
    fieldName,
    fieldCaption: def.headerName ?? base.fieldCaption ?? fieldName,
    fieldType: def.type ?? base.fieldType ?? DEFAULT_FIELD_TYPE,
  };

  if (def.minWidth !== undefined) next.minWidth = def.minWidth;
  if (def.hide !== undefined) next.hidden = def.hide;
  if (def.columnGroup) next.columnGroup = def.columnGroup;
  else if (def.columnSchema?.columnGroup) next.columnGroup = def.columnSchema.columnGroup;
  if (typeof def.editable === 'boolean') next.editable = def.editable;
  if (def.cellRenderer !== undefined) {
    next.render = def.cellRenderer;
  }

  const bridge = pickBridge(def);
  if (bridge) next.columnDef = bridge;
  else delete next.columnDef;

  return next;
}

/**
 * Legacy/ERP `ColumnSchema` → generic `ColumnDef`.
 * `columnSchema` on the result is the source object so `toColumnSchema` is lossless.
 */
export function toColumnDef<TRow = unknown, TValue = unknown>(
  schema: ColumnSchema,
): ColumnDef<TRow, TValue> & { columnSchema: ColumnSchema } {
  const bridge = schema.columnDef;
  const fieldName = schema.fieldName;
  const field = (bridge?.field ?? fieldName) as ColumnDef<TRow, TValue>['field'];
  const colId = bridge?.colId ?? fieldName;
  const editable: ColumnDef<TRow, TValue>['editable'] = bridge?.editableWhen
    ? (bridge.editableWhen as ColumnDef<TRow, TValue>['editable'])
    : schema.editable;

  const def: ColumnDef<TRow, TValue> & { columnSchema: ColumnSchema } = {
    colId,
    field,
    headerName: schema.fieldCaption,
    type: schema.fieldType,
    editable,
    minWidth: schema.minWidth,
    hide: schema.hidden,
    cellRenderer: schema.render,
    columnSchema: schema,
  };

  if (bridge?.valueGetter) {
    def.valueGetter = bridge.valueGetter as ColumnDef<TRow, TValue>['valueGetter'];
  }
  if (bridge?.valueSetter) {
    def.valueSetter = bridge.valueSetter as ColumnDef<TRow, TValue>['valueSetter'];
  }
  if (bridge?.valueFormatter) {
    def.valueFormatter = bridge.valueFormatter as ColumnDef<
      TRow,
      TValue
    >['valueFormatter'];
  }
  if (bridge?.comparator) {
    def.comparator = bridge.comparator as ColumnDef<TRow, TValue>['comparator'];
  }
  if (bridge?.width !== undefined) def.width = bridge.width;
  if (bridge?.flex !== undefined) def.flex = bridge.flex;
  if (bridge?.pinned !== undefined) def.pinned = bridge.pinned;
  if (bridge?.sortable !== undefined) def.sortable = bridge.sortable;
  if (bridge?.filter !== undefined) def.filter = bridge.filter;
  if (bridge?.aggFunc !== undefined) {
    def.aggFunc = bridge.aggFunc as ColumnDef<TRow, TValue>['aggFunc'];
  }
  if (schema.columnGroup) def.columnGroup = schema.columnGroup;

  return def;
}

export function mapColumnDefs<TRow>(defs: ColumnDef<TRow>[]): ColumnSchema[] {
  return defs.map((def) => toColumnSchema(def));
}

export function mapColDefOrGroups<TRow>(
  items: ColDefOrGroup<TRow>[],
): ColumnSchema[] {
  return flattenColDefOrGroup(items).map((def) => toColumnSchema(def));
}

export function mapColumnSchemasToDefs<TRow = unknown>(
  schemas: ColumnSchema[],
): Array<ColumnDef<TRow> & { columnSchema: ColumnSchema }> {
  return schemas.map((schema) => toColumnDef<TRow>(schema));
}
