//domain/policies

import {
  ColumnId,
  RowId,
} from '../value-objects';

export type Actor = { userId: string; roles: string[] };

export interface PermissionPolicy {
  canChangeCell(input: { actor: Actor; rowId: RowId; columnId: ColumnId }): boolean;
  canEdit?: (input: { actor: Actor }) => boolean;  
    canAddRow?: (input: { actor: Actor }) => boolean;  
    canDeleteRow?: (input: { actor: Actor }) => boolean;  
    canReorderRow?: (input: { actor: Actor }) => boolean;  
}
 
