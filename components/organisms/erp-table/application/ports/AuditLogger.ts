//application/ports
export type AuditEvent = {
  message: string;
  payload?: unknown
  type: 'INFORMATION'
  | 'ERROR'
  | 'FORBIDDEN'
  | 'CELL_CHANGED'
  | 'CELL_DISPLAY_CHANGED'
  | 'ROW_ADDED'
  | 'NEW_ROW_ADDED'
  | 'ROW_DELETED'
  | 'ROW_RESTORED'
  | 'ROW_REORDERED'
  | 'COLUMN_REORDERED'
  | 'UNIT_COLUMN_ADDED'
  | 'PAGE_CHANGED'
  | 'PAGE_SIZE_CHANGED'
  | 'TABLE_DELETED'
  | 'TABLE_RESET'
  | 'ROWS_LOADED'
  | 'DYNAMIC_DATA_REQUESTED'
  | 'VALIDATION_FAILED'
  | 'ROW_NOT_FOUND'
  | 'PAGE_NOT_CHANGED'
  | 'COLUMN_NOT_FOUND'
  | 'CELL_NOT_FOUND'
  | 'NOT_EDITABLE'
  | 'FORBIDDEN'
  | 'INVALID_VALUE'
  | 'DUPLICATE_ROW'
  | 'INVARIANT_VIOLATION'
  | 'ROW_NOT_EXPANDED'
  | 'DRAG_OR_DROP_ROW_NOT_FOUND';
};
export interface AuditLogger {
  log(event: AuditEvent): void;
}