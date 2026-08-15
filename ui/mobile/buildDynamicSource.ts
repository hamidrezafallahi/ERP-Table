import { ColumnSchema } from "../../bootstrap/type";
import { UIRow } from "../type";

export function buildDynamicSourceForRow(
  dynamicSource: ColumnSchema["dynamicSource"],
  row: UIRow,
): ColumnSchema["dynamicSource"] {
  if (!dynamicSource) return dynamicSource;

  const { dependsOn, dependOn, ...rest } = dynamicSource;

  if (dependOn) {
    return dynamicSource;
  }

  if (!dependsOn?.length) {
    return dynamicSource;
  }

  const deps = dependsOn.map((fieldName) => ({
    fieldName,
    value: row.cells[fieldName]?.value ?? null,
  }));

  return {
    ...rest,
    dependsOn,
    dependOn: deps.length === 1 ? deps[0] : deps,
  };
}

export function resolveColumnMetaForRow(
  col: ColumnSchema,
  row: UIRow,
): ColumnSchema {
  if (!col.dynamicSource) return col;

  return {
    ...col,
    dynamicSource: buildDynamicSourceForRow(col.dynamicSource, row),
  };
}
