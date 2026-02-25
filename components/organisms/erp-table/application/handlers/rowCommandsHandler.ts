// application/handlers/rowCommandsHandler.ts

import { DomainError } from '../../domain/errors/DomainError';
import {
  Actor,
  PermissionPolicy,
} from '../../domain/policies';
import { RowId } from '../../domain/value-objects';
import {
  AddEmptyRowCommand,
  DeleteRowCommand,
  DuplicateRowCommand,
  RowReorderedCommand,
} from '../commands';
import { AuditLogger } from '../ports/AuditLogger';
import { TableRepository } from '../ports/TableRepository';

/* ======================================================
   Add New Row
   ====================================================== */

export class AddNewRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) { }

  async execute(command: AddEmptyRowCommand, actor: Actor) {
    try {
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission.canAddRow({ actor })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to add a new row',
          { actor }
        );
      }
      const event = table.addNewRow();
      await this.repo.save(command.store, table);
      this.audit.log({ type: 'INFORMATION', message: event.type, payload: event.rowId });
      return event;
    } catch (error) {

      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error }
        });
      } return null
    }
  }
}

/* ======================================================
   Duplicate Row
   ====================================================== */

export class DuplicateRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) { }

  async execute(command: DuplicateRowCommand, actor: Actor) {
    try {
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission.canCopyRow({ actor, rowId: command.rowId })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to duplicate a row',
          { actor }
        );
      }
      const rowId = new RowId(command.rowId);
      const event = table.addRow(rowId);
      await this.repo.save(command.store, table);
      this.audit.log({ type: 'INFORMATION', message: event.type, payload: event.rowId });
      return event;
    } catch (error) {
      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error }
        });
      } return null
    }
  }
}

/* ======================================================
   Delete Row
   ====================================================== */

export class DeleteRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) { }

  async execute(command: DeleteRowCommand, actor: Actor) {
    try {
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission.canDeleteRow({ actor, rowId: command.rowId })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to delete this row',
          { actor }
        );
      }
      const rowId = new RowId(command.rowId);
      const event = table.deleteRow(rowId);

      if (!event) {
        throw new DomainError(
          'ROW_NOT_FOUND',
          'Row not found or already deleted',
          { rowId: rowId.value }
        );
      }

      await this.repo.save(command.store, table);

      this.audit.log({ type: 'INFORMATION', message: event.type, payload: event.rowId });

      return event;
    } catch (error) {

      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error }
        });
      } return null
    }
  }
}
/* ======================================================
   Reorder Row
   ====================================================== */
export class ReorderRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) { }

  async execute(command: RowReorderedCommand, actor: Actor) {
    try {
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission?.canReorderRow?.({ actor, rowId: command.draggedRowId })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to reorder this row',
          { actor }
        );
      }
      const draggedRowId = new RowId(command.draggedRowId);
      const droppedRowId = new RowId(command.droppedRowId);
      const event = table.reorderRows(draggedRowId.value, droppedRowId.value, command.position);
      if (!event) {
        this.audit.log({ type: 'ERROR', message: event.type, payload: { event } });

        throw new DomainError(
          'DRAG_OR_DROP_ROW_NOT_FOUND',
          `Drag row num is ${draggedRowId.value} && drop row num is ${droppedRowId.value} `,
          { draggedRowId: draggedRowId.value, droppedRowId: droppedRowId.value }
        );
      }

      await this.repo.save(command.store, table);
      return event;

    } catch (error) {

      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error }
        });
      } return null
    }


  }
}