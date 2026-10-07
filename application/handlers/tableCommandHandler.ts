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
import { isWindowedRepository, TableRepository } from '../ports/TableRepository';

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
      if (!command.tableKey) return [];
      if (isWindowedRepository(this.repo)) {
        // Replace RAM window with the requested page from IndexedDB
        const loaded = await this.repo.loadPage(command.store, command.tableKey, command.page);
        if (!loaded) return [];
      } else {
        const table = await this.repo.getById(command.store, command.tableKey);
        table.changePage(command.page);
        await this.repo.save(command.store, table);
      }

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
    try {
      if (!command.tableKey) return [];
      if (isWindowedRepository(this.repo)) {
        // Keep the current page when only pageSize changes (don't jump to page 1)
        let page = 1;
        try {
          const current = await this.repo.getById(command.store, command.tableKey);
          page = current.getPagination().page || 1;
        } catch {
          page = 1;
        }
        const loaded = await this.repo.loadPage(
          command.store,
          command.tableKey,
          page,
          command.pageSize,
        );
        if (!loaded) return [];
      } else {
        const table = await this.repo.getById(command.store, command.tableKey);
        table.changePageSize(command.pageSize);
        await this.repo.save(command.store, table);
      }
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
      return;
    }

    // ستون‌های شرطی محتوا دار (whenFieldTruthy / whenRemoteFlag) باید هنگام
    // سوییچ تب، در کالکشن خودشان نمایان شوند — همان قراردادِ بارگذاری اولیه:
    // "ستون وابسته‌ای که محتوا دارد فقط در کالکشن مربوطه نمایش داده شود".
    // بدون این، فلگ اشتباه ذخیره‌شده از ران قبلی (مثلاً hidden=true از
    // bootstrap وقتی تب دیگری فعال بود) تا باز شدن مجدد صفحه می‌ماند.
    if (
      visibility?.kind === 'whenFieldTruthy' ||
      visibility?.kind === 'whenRemoteFlag'
    ) {
      const rows = collection.getRows();
      const hasValue = Array.from(rows.values()).some(
        row => !!row.getCell(colCfg.fieldName)?.getValue(),
      );
      if (hasValue) {
        colCfg.hidden = false;
      }
    }
  });
}

  async execute(
    command: SetActiveCollectionCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const repo = this.repo;
    if (!isWindowedRepository(repo)) {
      const table = await repo.getById(command.store, command.tableKey);
      try {
        table.setActiveCollection(command.activeCollection);
        this.applyVisibility({ table, command });
        await this.repo.save(command.store, table);
        const out: TableEvent = {
          type: 'ACTIVE_COLLECTION_CHANGED',
          tableId: command.tableKey,
        };
        this.audit.log({ type: out.type, message: out.type, payload: out.tableId });
        return [out];
      } catch (error) {
        return this.handleSetActiveError(error);
      }
    }
    // First persist pending edits of the current window, then swap the RAM
    // window with page 1 of the requested collection from IndexedDB.
    // (A plain setActiveCollection + save here used to persist an EMPTY window
    // for the new collection, wiping the rows of every other collection.)
    await repo.getById(command.store, command.tableKey);
    const loaded = await repo.setActiveCollection(
      command.store,
      command.tableKey,
      command.activeCollection,
    );
    try {
      if (!loaded) {
        const out: TableEvent = {
          type: 'ACTIVE_COLLECTION_CHANGED',
          tableId: command.tableKey,
        };
        this.audit.log({ type: out.type, message: out.type, payload: out.tableId });
        return [out];
      }

      loaded.setActiveCollection(command.activeCollection);
      this.applyVisibility({ table: loaded, command });
      await this.repo.save(command.store, loaded);
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
      return this.handleSetActiveError(error);
    }
  }

  private handleSetActiveError(error: unknown): TableEvent[] {
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
    }
    return [];
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