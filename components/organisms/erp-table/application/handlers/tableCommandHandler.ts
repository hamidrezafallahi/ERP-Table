// application/handlers/TableCommandHandler.ts

import { IDetailColumnConfig } from '../../bootstrap/type';
import { DomainError } from '../../domain/errors/DomainError';
import {
  Actor,
  PermissionPolicy,
} from '../../domain/policies';
import {
  ChangePageCommand,
  ChangePageSizeCommand,
  ChangeUnitLevelCommand,
  DeleteTableCommand,
  ResetTableCommand,
  TableChangeTypeCommand,
} from '../commands';
import { TableEvent } from '../events';
import { AuditLogger } from '../ports/AuditLogger';
import { RemoteApi } from '../ports/RemoteApi';
import { TableRepository } from '../ports/TableRepository';

type DynamicConfig = {
  columnMeta: Map<string, IDetailColumnConfig>;
  remoteApi: RemoteApi;
};

/* ======================================================
   Change Unit Level
   ====================================================== */

export class ChangeUnitLevelHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly dynamic?: DynamicConfig
  ) { }

  async execute(
    command: ChangeUnitLevelCommand,
    actor: Actor
  ): Promise<TableEvent[]> {

    const table = await this.repo.getById(command.store, command.tableKey);

    try {

      table.addColumns([]);

      await this.repo.save(command.store, table);

      const out: TableEvent = {
        type: 'UNIT_COLUMN_ADDED',
        tableId: command.tableKey,
        reason: 'UNIT_LEVEL_UPDATED',
        details: { level: command.level },
      };

      this.audit.log({
        type: out.type,
        message: out.reason,
        payload: out.details
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
      } return null
    }
  }
}

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
      } return null
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
      } return null
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
      } return null
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
      } return null
    }
  }
}
/* ======================================================
  Reset Table 
  ====================================================== */

export class ChangeTableTypeCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
  ) { }
  async execute(
    command: TableChangeTypeCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {
      table.setActiveTableType(command.tableType)
      await this.repo.save(command.store, table);
      const out: TableEvent = {
        type: 'TABLE_TYPE_CHANGED',
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
      } return null
    }
  }
}