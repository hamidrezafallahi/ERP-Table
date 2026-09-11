//domain/policies

export type Actor = { userId: string; roles: string[] };

export interface PermissionPolicy {
  canChangeCell(input: { actor: Actor; rowId: number; columnId: string }): boolean;
  canEdit?: (input: { actor: Actor; rowId: number; columnId: string }) => boolean;
  canAddRow?: (input: { actor: Actor }) => boolean;
  canCopyRow?: (input: { actor: Actor;rowId: number; }) => boolean;
  canDeleteRow?: (input: { actor: Actor; rowId: number; }) => boolean;
  canReorderRow?: (input: { actor: Actor; rowId: number; }) => boolean;
  canReorderColumn?: (input: { actor: Actor }) => boolean;
}

