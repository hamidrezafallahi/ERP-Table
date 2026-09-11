import type { ReactNode } from 'react';

import type { ColumnSchema, FieldType } from '../../bootstrap/type';
import {
  resolveCustomCellNode,
  type CellRenderContext,
  type CustomCellResolveResult,
} from './cellRenderContext';
import { TextAreaCell } from './TextAreaCell';

export type CellComponent = (ctx: CellRenderContext) => ReactNode;

/**
 * Built-in FieldType keys plus free strings for host cell types (PR-56 `textArea`, …).
 */
export type CellComponentMap = Partial<Record<FieldType, CellComponent>> & {
  [customType: string]: CellComponent | undefined;
};

export function resolveRegisteredCellNode(
  fieldType: string | undefined,
  components: CellComponentMap | undefined,
  ctx: CellRenderContext,
): CustomCellResolveResult {
  if (!fieldType || !components) {
    return { hit: false };
  }
  const render = components[fieldType];
  if (typeof render !== 'function') {
    return { hit: false };
  }
  return { hit: true, node: (render(ctx) ?? null) as ReactNode };
}

/** Built-in registry. Host `components` override these keys. */
export const DEFAULT_CELL_COMPONENTS: CellComponentMap = {
  textArea: TextAreaCell,
};

export function mergeCellComponents(
  host?: CellComponentMap,
): CellComponentMap {
  return { ...DEFAULT_CELL_COMPONENTS, ...host };
}

/**
 * Column `render` (PR-54) wins; then `components[fieldType]` (PR-55/56);
 * miss → built-in FieldType switch.
 */
export function resolveBoundCellNode(
  meta: Pick<ColumnSchema, 'render' | 'fieldType'> | undefined,
  components: CellComponentMap | undefined,
  ctx: CellRenderContext,
): CustomCellResolveResult {
  const column = resolveCustomCellNode(meta, ctx);
  if (column.hit) {
    return column;
  }
  return resolveRegisteredCellNode(
    meta?.fieldType,
    mergeCellComponents(components),
    ctx,
  );
}
