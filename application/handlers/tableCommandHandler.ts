// application/handlers/TableCommandHandler.ts

import { ColumnSchema } from '../../bootstrap/type';
import { Table } from '../../domain/entities/Table';
import { DomainError } from '../../domain/errors/DomainError';
import {
  Actor,
  PermissionPolicy,
} from '../../domain/policies';
import {
  ChangePageCommand,
  ChangePageSizeCommand,
  ColumnReorderedCommand,
  DeleteTableCommand,
  ResetTableCommand,
  SetActiveCollectionCommand,
} from '../commands';
import { TableEvent } from '../events';
import { AuditLogger } from '../ports/AuditLogger';
import { RemoteApi } from '../ports/RemoteApi';
import { TableRepository } from '../ports/TableRepository';

type DynamicConfig = {
  columnMeta: Map<string, ColumnSchema>;
  remoteApi: RemoteApi;
};

/* ======================================================
   Change Page
   ====================================================== */

export class ChangePageCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger
  ) { }

  async execute(
    command: ChangePageCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    try {
      const table = await this.repo.getById(command.store, command.tableKey);

      table.changePage(command.page);

      await this.repo.save(command.store, table);

      const out: TableEvent = {
        type: 'PAGE_CHANGED',
        tableId: command.tableKey,
        page: command.page
      };

      this.audit.log({
        type: out.type,
        message: out.type,
        payload: out.page
      });
      return [out];

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
      } return []
    }
  }
}

/* ======================================================
  Change Page size
  ====================================================== */

export class ChangePageSizeCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger
  ) { }

  async execute(
    command: ChangePageSizeCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {
      table.changePageSize(command.pageSize);
      await this.repo.save(command.store, table);
      const out: TableEvent = {
        type: 'PAGE_SIZE_CHANGED',
        tableId: command.tableKey,
        pageSize: command.pageSize
      };

      this.audit.log({
        type: out.type,
        message: out.type,
        payload: out.tableId
      });
      return [out];
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
      } return []
    }
  }
}
/* ======================================================
  Delete Table 
  ====================================================== */

export class DeleteTableCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,

  ) { }
  async execute(
    command: DeleteTableCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {
      this.repo.delete(command.store, command.tableKey)
      await this.repo.save(command.store, table);
      const out: TableEvent = {
        type: 'TABLE_DELETED',
        tableId: command.tableKey,
      };

      this.audit.log({
        type: out.type,
        message: out.type,
        payload: out.tableId
      });
      return [out];
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
      } return []
    }
  }
}

/* ======================================================
  Reset Table 
  ====================================================== */

export class ResetTableCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,

  ) { }
  async execute(
    command: ResetTableCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {
      this.repo.delete(command.store, command.tableKey)
      await this.repo.save(command.store, table);
      const out: TableEvent = {
        type: 'TABLE_RESET',
        tableId: command.tableKey,
      };

      this.audit.log({
        type: out.type,
        message: out.type,
        payload: out.tableId
      }); return [out];
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
      } return []
    }
  }
}
/* ======================================================
  Reset Table 
  ====================================================== */

export class SetActiveCollectionCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
  ) { }
private async applyVisibility(input: {
  table: Table;
  command: SetActiveCollectionCommand;
}): Promise<void> {
  const { table, command } = input;

  const collection = table.getCollections().get(command.activeCollection);
  if (!collection) return;

  collection.getColumns().forEach(colCfg => {
    const visibility = colCfg.visibility;

    if (
      (visibility?.kind === "whenCollection" &&
        visibility.collection === command.activeCollection) ||
      (visibility?.kind === "whenTableType" &&
        visibility.tableType === command.activeCollection)
    ) {
      colCfg.hidden = false;
    }
  });
}

  async execute(
    command: SetActiveCollectionCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {
      table.setActiveCollection(command.activeCollection)
       this.applyVisibility({table,command});
      await this.repo.save(command.store, table);
      const out: TableEvent = {
        type: 'ACTIVE_COLLECTION_CHANGED',
        tableId: command.tableKey,
      };
      this.audit.log({
        type: out.type,
        message: out.type,
        payload: out.tableId
      }); return [out];
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
      } return []
    }
  }
}

/* ======================================================
   Reorder Column
   ====================================================== */

export class ReorderColumnCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy,
  ) {}

  async execute(
    command: ColumnReorderedCommand,
    actor: Actor,
  ): Promise<TableEvent[]> {
    try {
      if (
        this.permission.canReorderColumn &&
        !this.permission.canReorderColumn({ actor })
      ) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to reorder columns',
          { actor },
        );
      }

      const table = await this.repo.getById(command.store, command.tableKey);
      const columns = table.getActiveCollectionColumns();
      const n = columns.length;
      const { sourceIndex, destIndex } = command;

      if (
        !Number.isInteger(sourceIndex) ||
        !Number.isInteger(destIndex) ||
        sourceIndex < 0 ||
        destIndex < 0 ||
        sourceIndex >= n ||
        destIndex >= n
      ) {
        throw new DomainError(
          'COLUMN_NOT_FOUND',
          'Column reorder indices are out of range',
          { sourceIndex, destIndex, columnCount: n },
        );
      }

      table.reorderColumns(sourceIndex, destIndex);
      await this.repo.save(command.store, table);

      const out: TableEvent = {
        type: 'COLUMN_REORDERED',
        tableId: command.tableKey,
        sourceIndex,
        destIndex,
      };
      this.audit.log({
        type: out.type,
        message: out.type,
        payload: { sourceIndex, destIndex },
      });
      return [out];
    } catch (error) {
      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details,
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error },
        });
      }
      return [];
    }
  }
}