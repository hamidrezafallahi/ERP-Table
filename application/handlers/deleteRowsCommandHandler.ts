// application/handlers/deleteRowsCommandHandler.ts
//
// Page-window (persistence 'paged-idb') bulk delete. Kept in its own module so
// the default bundle only pays for it when the paged mode is actually used.

import { DomainError } from '../../domain/errors/DomainError';
import {
  Actor,
  PermissionPolicy,
} from '../../domain/policies';
import { DeleteRowsCommand } from '../commands';
import { AuditLogger } from '../ports/AuditLogger';
import { WindowedTableRepository } from '../ports/TableRepository';

/* ======================================================
   Delete Selected Rows (full dataset / IndexedDB SoT)
   ====================================================== */

export class DeleteRowsCommandHandler {
  constructor(
    private readonly repo: WindowedTableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy,
  ) { }

  /**
   * Bulk delete — never toggles restore:
   * - `Added` → hard-remove from IndexedDB
   * - otherwise → `rowState = Deleted` (soft; قابل برگرداندن با حذف تکی)
   * Already-`Deleted` rows stay deleted.
   */
  async execute(command: DeleteRowsCommand, actor: Actor) {
    try {
      const rowIds = command.rowIds ?? [];
      if (rowIds.length === 0) return null;

      for (const rowId of rowIds) {
        if (!this.permission.canDeleteRow?.({ actor, rowId })) {
          throw new DomainError(
            'FORBIDDEN',
            'Actor is not allowed to delete selected rows',
            { actor, rowId },
          );
        }
      }

      // Memory Iron Rule: streamed validity check (heap = one batch) — every
      // requested id must exist in the active collection's persisted records.
      const remainingWanted = new Set(rowIds);
      let foundAny = false;
      await this.repo.iterateRowRecords(
        command.store,
        command.tableKey,
        'active',
        async records => {
          for (const rec of records) {
            if (remainingWanted.delete(rec.rowId)) foundAny = true;
            if (remainingWanted.size === 0) return false; // early stop
          }
        },
      );
      if (!foundAny) {
        throw new DomainError('ROW_NOT_FOUND', 'No requested rows found', {
          tableKey: command.tableKey,
        });
      }
      // Ids absent from persisted records (e.g. unsaved RAM-only additions)
      // are skipped silently — the persisted delete cannot act on them.

      // Soft/hard delete applied DIRECTLY on IndexedDB records in one
      // readwrite transaction (cursor-based) — never getAllRows + replaceAll.
      // Added → hard-removed; others → rowState=Deleted on the record;
      // already-Deleted stay deleted (no restore on bulk delete).
      const { softDeleted, hardRemoved, remaining } =
        await this.repo.softDeleteRows(command.store, command.tableKey, rowIds);

      this.audit.log({
        type: 'INFORMATION',
        message: 'ROWS_DELETED',
        payload: {
          requested: rowIds.length,
          hardRemoved,
          softDeleted,
          remaining,
        },
      });

      return {
        removed: hardRemoved,
        softDeleted,
        remaining,
      };
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
      return null;
    }
  }
}
