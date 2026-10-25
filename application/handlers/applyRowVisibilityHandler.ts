// application/handlers/applyRowVisibilityHandler.ts — lazy module (loaded the
// first time a row with `resolveOn` columns becomes active).
import { ColumnSchema } from '../../bootstrap/type';
import { DomainError } from '../../domain/errors/DomainError';
import { Actor, PermissionPolicy } from '../../domain/policies';
import { ColumnId, RowId } from '../../domain/value-objects';
import { ApplyRowVisibilityCommand } from '../commands';
import { TableEvent } from '../events';
import { AuditLogger } from '../ports/AuditLogger';
import { TableRepository } from '../ports/TableRepository';
import {
  applyRemoteVisibilityRules,
  DynamicConfig,
  logError,
} from './cellCommandsHandler';

/* ======================================================
   ApplyRowVisibilityHandler
   ====================================================== */

/**
 * هنگام فعال‌شدن (active) شدن یک سطر اجرا می‌شود:
 * برای هر ستون دارای resolveOn که سلولش مقدار دارد، applyRemoteVisibilityRules
 * را (بدون پاک‌کردن سلول‌های وابسته) صدا می‌زند تا visibilityCondition سطر فعال
 * از سرویس ریموت به‌روز شود. مقدار RowState سطر را تغییر نمی‌دهد.
 */
export class ApplyRowVisibilityHandler {
  /**
   * Dedupe guard: آخرین امضای (row + کالکشن + مقادیر ستون‌های resolveOn) که
   * برایش سر ریموت صدا زده شد. بدون این، دو مسیر مستقل (کلیک سطر →
   * setActiveRow و کلیک سلول → setActiveCell) و رفرش‌های متوالی، همان API را
   * چند بار صدا می‌زدند. وقتی مقادیر عوض شود امضای جدید است و API دوباره
   * صدا زده می‌شود.
   */
  private lastSignature: string | null = null;

  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
    private readonly dynamic?: DynamicConfig,
  ) { }

  async execute(
    command: ApplyRowVisibilityCommand,
    actor: Actor,
  ): Promise<TableEvent[]> {
    const { store, tableKey, rowId } = command;
    const table = await this.repo.getById(store, tableKey);

    try {
      if (!this.dynamic) return [];

      const row = table.getRow(rowId);
      if (!row) {
        throw new DomainError('ROW_NOT_FOUND', `Row ${rowId} not found`, { rowId });
      }

      const previousVisibility = { ...(row.getVisibilityCondition() ?? {}) };
      const activeCollection = table.getActiveCollectionName() ?? 'default';

      // گارد کالکشن: هر کالکشن فقط resolveOnِ خودش را اجرا کند. بدون این،
      // دوقلوهای RpWayId سایر کالکشن‌ها هم حلقه را طی می‌کردند و API به ازای
      // هر کالکشن (۴ بار) صدا زده می‌شد.
      const resolveOnColumns = Array.from(this.dynamic.columnMeta.values())
        .filter(
          (colCfg): colCfg is ColumnSchema & { resolveOn: NonNullable<ColumnSchema['resolveOn']> } =>
            colCfg.resolveOn != null,
        )
        .filter(
          colCfg => (colCfg.fieldCollection ?? 'default') === activeCollection,
        );

      if (resolveOnColumns.length === 0) return [];

      // امضای dedupe: مقادیر فعلی سلول‌های resolveOn این سطر.
      const signatureParts = resolveOnColumns.map(colCfg =>
        String(row.getCell(colCfg.resolveOn.fieldName)?.getValue() ?? ''),
      );
      const signature =
        `${store}:${tableKey}:${rowId}:${activeCollection}:${signatureParts.join('|')}`;
      if (signature === this.lastSignature) {
        // همان سطر با همان مقادیر — فلگ‌ها عوض نشده‌اند؛ API و save لازم نیست.
        return [];
      }

      // ثبت امضا «قبل» از فراخوانی ریموت: دو مسیر dispatch (کلیک سطر و
      // کلیک سلول) تقریباً همزمان اجرا می‌شوند و اگر امضا بعد از await ثبت
      // می‌شد، هر دو از فیلتر رد می‌شدند و API دوبار صدا زده می‌شد.
      this.lastSignature = signature;

      for (const colCfg of resolveOnColumns) {
        const cell = row.getCell(colCfg.resolveOn.fieldName);
        if (!cell) continue;
        const value = cell.getValue();
        if (value == null || value === '') continue;

        const ok = await this.applyRemoteVisibilityRules({
          table,
          rowId: new RowId(rowId),
          changedColumnId: new ColumnId(colCfg.resolveOn.fieldName),
          newValue: value,
          clearDependents: false,
        });
        // Failed lookup: forget the signature so the next activation retries.
        if (!ok) this.lastSignature = null;
      }

      await this.repo.save(store, table);

      const out: TableEvent = {
        type: 'CELL_CHANGED',
        tableId: tableKey,
        rowId,
        columnId: 'visibilityCondition',
        previousValue: previousVisibility,
        newValue: row.getVisibilityCondition(),
      };
      this.audit.log({ type: 'INFORMATION', message: 'ROW_VISIBILITY_APPLIED', payload: out });
      return [out];

    } catch (e) {
      logError(this.audit, e, `ApplyRowVisibilityHandler[${tableKey}:${rowId}]`);
      return [];
    }
  }

  /* ── identical to ChangeCellValueHandler helper ───────────────────── */

  private applyRemoteVisibilityRules(input: Parameters<typeof applyRemoteVisibilityRules>[1]): Promise<boolean> {
    return applyRemoteVisibilityRules(this.dynamic, input, this.audit);
  }
}