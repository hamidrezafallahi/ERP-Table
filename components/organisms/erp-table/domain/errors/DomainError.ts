//domain/errors
export type DomainErrorCode =
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

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
