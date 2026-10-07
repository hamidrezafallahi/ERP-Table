// engine/managers/NavigationManager.ts

import {
  Actor,
  ApplyDynamicProjectionCommand,
  TableCommand,
  ApplyRowVisibilityCommand,
} from '../../application/commands';
import { TableRepository } from '../../application/ports/TableRepository';
import { TableAppService } from '../../application/TableAppService';
import { ColumnSchema } from '../../bootstrap/type';
import { Row } from '../../domain/entities/Row';
import { EngineErrorHandler } from '../EngineErrorHandler';
import { TableStore } from '../tableStore';
import {
  TableState,
  TableViewState,
} from '../type';
import type { SparseRowIndex } from '../SparseRowIndex';

export class NavigationManager {
  constructor(
    private readonly readStore: () => TableStore<TableState> | undefined,
    private readonly app: TableAppService,
    private readonly repo: TableRepository,
    private readonly actor: Actor,
    private readonly err: EngineErrorHandler,
    /**
     * getViewState از TableEngine تزریق می‌شه
     * تا NavigationManager به ViewStateBuilder وابستگی مستقیم نداشته باشه
     */
    private readonly getViewState: () => TableViewState | undefined,
    private readonly dispatch: (cmd: TableCommand) => Promise<void>,
    /** Ordered UI row index (PR-99) — O(1) vertical neighbor. */
    private readonly getUiRowIndex: () => SparseRowIndex<number>,
    /**
     * متای زندهٔ ستون‌ها از کانفیگ (دارای resolveOn / dynamicSource). در حالت
     * page-window ستون‌های RAM از IndexedDB می‌آیند و توابع را ندارند؛ پس برای
     * تشخیص ستون‌های شرطیِ فعال‌شدن سطر لازم است. optional.
     */
    private readonly columnMeta?: Map<string, ColumnSchema>,
  ) { }

  private getStore(tableKey: string) {
    const store = this.readStore();
    if (!store) {
      this.err.notFound('TableStore', tableKey, 'NavigationManager');
    }
    return store;
  }

  setActiveCell(cmd: {
    tableKey: string;
    rowId: number;
    columnId: string;
  }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    store.setState(prev => {
      const current = prev.activeCell;
      if (
        current &&
        current.rowId === cmd.rowId &&
        current.columnId === cmd.columnId
      ) {
        return prev;
      }
      return {
        ...prev,
        activeRowId: cmd.rowId,
        activeCell: { rowId: cmd.rowId, columnId: cmd.columnId },
      };
    });
  }
  async setActiveRow(cmd: {
    store: string;
    tableKey: string;
    rowId: number;
  }): Promise<void> {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;
    const { table } = store.getState();
    if (!table) return;
    const row = table.getRows().find(r => r.id.value === cmd.rowId);
    if (!row) {
      this.err.handle('Row not found in setActiveRow', `${cmd.tableKey, cmd.rowId}`);
      return;
    }
    // Re-apply remote visibility flags for this row without wiping dependent values
    // (clearing is only for real cell value changes via CHANGE_CELL_VALUE).
    await this.fetchVisibilityCondition(cmd, row);
    store.setState(prev => {
      if (prev.activeRowId === cmd.rowId) {
        return {
          ...prev,
          rangeAnchorRowId: cmd.rowId,
        };
      }
      return {
        ...prev,
        activeRowId: cmd.rowId,
        activeCell: null,
        rangeAnchorRowId: cmd.rowId,
      };
    });
  }

  activateFirstCell(cmd: { tableKey: string; rowId: number }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const state = store.getState();
    const firstEditable = state.table
      .getActiveCollectionColumns()
      .find(
        c =>
          c.editable !== false &&
          c.fieldName !== 'index' &&
          c.fieldType !== 'index' &&
          c.fieldType !== 'static' &&
          !c.hidden,
      );

    if (!firstEditable) return;

    store.setState(() => ({
      ...state,
      activeCell: { rowId: cmd.rowId, columnId: firstEditable.fieldName },
    }));
  }

  async fetchVisibilityCondition(
    cmd: { store: string; tableKey: string; rowId: number },
    row: Row,
  ): Promise<void> {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const { table } = store.getState();
    if (!table) return;

    // ستون‌های جدول RAM پس از معماری page-window از متای ذخیره‌شدهٔ IndexedDB
    // ساخته می‌شوند که توابع (resolveOn / dynamicSource) را serialize نمی‌کند؛
    // پس منبع تشخیص باید columnMeta زندهٔ کانفیگ باشد، نه ستون‌های RAM.
    const columns: ColumnSchema[] = this.columnMeta
      ? Array.from(this.columnMeta.values()).filter(
          col => (col.fieldCollection ?? 'default') ===
            (table.getActiveCollectionName() ?? 'default'),
        )
      : table.getColumns();
    const cellDependency = new Set<string>();

    columns
      .filter(
        col =>
          !!col.dynamicSource?.dependsOn &&
          col.dynamicSource.dependsOn.length > 0,
      )
      .forEach(col => {
        const deps = col.dynamicSource?.dependsOn;
        if (!deps) return;
        for (const dep of deps) {
          cellDependency.add(dep);
        }
      });

    /* ستون‌های دارای resolveOn تعیین‌کنندهٔ visibilityCondition ریموت سطرند؛
       هنگام فعال‌شدن سطر (مثلاً در حالت ویرایش) باید visibilityCondition
       از روی مقادیر فعلی آن‌ها دوباره گرفته شود. */
    const resolveOnFields = new Set(
      columns
        .filter(col => col.resolveOn != null)
        .map(col => col.resolveOn!.fieldName)
        .filter(f => !!f),
    );

    for (const col of resolveOnFields) {
      const cell = row.getCell(col);
      if (!cell) continue;
      const val = cell.getValue();
      if (val == null || val === '') continue;

      const command: ApplyRowVisibilityCommand = {
        type: 'APPLY_ROW_VISIBILITY',
        store: cmd.store,
        tableKey: cmd.tableKey,
        rowId: cmd.rowId,
      };
      try {
        await this.app.execute(command, this.actor);
      } catch (e) {
        this.err.handle(e, 'NavigationManager.fetchVisibilityCondition.applyRowVisibility');
      }
    }

    for (const col of cellDependency) {
      const cell = row.getCell(col);

      if (!cell) {
        this.err.notFound('Cell not found', `${cmd.rowId, col}`);
        continue;
      }

      const val = cell.getValue(); if (val) {
        const command: ApplyDynamicProjectionCommand = {
          type: 'APPLY_DYNAMIC_PROJECTION',
          store: cmd.store,
          tableKey: cmd.tableKey,
          rowId: cmd.rowId,
          columnId: col,
        };
        try {
          await this.app.execute(command, this.actor);
        } catch (e) {
          this.err.handle(e, 'NavigationManager.fetchVisibilityCondition');
        }
      }
    }

    try {
      const updated = await this.repo.getById(cmd.store, cmd.tableKey);
      const currentStore = this.getStore(cmd.tableKey);
      if (currentStore && updated) {
        const prev = currentStore.getState();
        currentStore.setState(() => ({ ...prev, table: updated }));
      }
    } catch (e) {
      this.err.handle(e, 'NavigationManager.fetchVisibilityCondition.reload');
    }
  }

  async moveActiveCell(cmd: {
    store: string;
    tableKey: string;
    rowId: number;
    columnId: string;
    direction: 'next' | 'prev';
  }): Promise<void> {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const state = await store.getState();
    const table = state.table;

    const row = table.getRow(cmd.rowId);
    if (!row) {
      this.err.notFound('Row not found in moveActiveCell', `${cmd.rowId}`);

      return;
    }

    const disabledCols = Object.entries(
      row.getVisibilityCondition() ?? {},
    )
      .filter(([, value]) => value === false)
      .map(([key]) => key);

    const columns = table
      .getActiveCollectionColumns()
      .filter(
        c =>
          !c.hidden &&
          c.editable !== false &&
          !disabledCols.includes(c.fieldName) &&
          c.fieldName !== 'index' &&
          c.fieldType !== 'index' &&
          c.fieldType !== 'static',
      );


    const currentColIndex = columns.findIndex(c => c.fieldName === cmd.columnId);
    if (currentColIndex === -1) return;

    const nextColIndex =
      cmd.direction === 'next' ? currentColIndex + 1 : currentColIndex - 1;
    const nextColumn = columns[nextColIndex];
    // حرکت در همان سطر
    if (nextColumn !== undefined) {
      store.setState(prev => ({
        ...prev,
        activeRowId: cmd.rowId,
        activeCell: { rowId: cmd.rowId, columnId: nextColumn.fieldName },
      }));
      return;
    }
    // رسیدیم به انتهای ستون‌های سطر جاری
    const allRows = table.getRows();
    const currentRowIndex = allRows.findIndex(r => r.id.value === cmd.rowId);
    const isLastRow = currentRowIndex === allRows.length - 1;
    const isFirstRow = currentRowIndex === 0;

    if (cmd.direction === 'next') {
      if (isLastRow) {
        await this.addEmptyRowAndActivate(cmd, store, state, columns);
        return;
      }

      let nextValidRowIndex = -1;
      for (let offset = 1; currentRowIndex + offset < allRows.length; offset++) {
        if (allRows[currentRowIndex + offset].rowState.value !== 'Delete') {
          nextValidRowIndex = currentRowIndex + offset;
          break;
        }
      }

      if (nextValidRowIndex !== -1) {
        const nextRowId = allRows[nextValidRowIndex].id.value;
        store.setState(() => ({
          ...state,
          activeRowId: nextRowId,
          activeCell: { rowId: nextRowId, columnId: columns[0].fieldName },
        }));
        return;
      }

      await this.addEmptyRowAndActivate(cmd, store, state, columns);
      return;
    }

    if (cmd.direction === 'prev') {
      if (isFirstRow) return;

      let prevValidRowIndex = -1;
      for (let offset = 1; currentRowIndex - offset >= 0; offset++) {
        if (allRows[currentRowIndex - offset].rowState.value !== 'Delete') {
          prevValidRowIndex = currentRowIndex - offset;
          break;
        }
      }

      if (prevValidRowIndex !== -1) {
        const prevRowId = allRows[prevValidRowIndex].id.value;
        const lastColumn = columns[columns.length - 1];
        store.setState(() => ({
          ...state,
          activeRowId: prevRowId,
          activeCell: { rowId: prevRowId, columnId: lastColumn.fieldName },
        }));
      }
    }
  }

  private async addEmptyRowAndActivate(
    cmd: { store: string; tableKey: string },
    store: TableStore<TableState>,
    state: TableState,
    columns: ReturnType<typeof state.table.getColumns>,
  ): Promise<void> {
    try {
      const newRow = await this.app.execute(
        {
          type: 'ADD_EMPTY_ROW',
          store: cmd.store,
          tableKey: cmd.tableKey,
          autoActivate: true,
        },
        this.actor,
      );
      const firstColumn = columns[0];

      if (!firstColumn) {
        this.err.notFound('No editable column found after adding row', cmd.tableKey);
        return;
      }


      if (
        !newRow ||
        typeof newRow !== 'object' ||
        !('rowId' in newRow)
      ) {
        this.err.notFound('Invalid ADD_EMPTY_ROW response', `${newRow}`);
        return;
      }


      const rowIdValue = (newRow as { rowId?: { value?: unknown } }).rowId?.value;
      const rowId = typeof rowIdValue === 'number' ? rowIdValue : undefined;

      if (!rowId) {

        this.err.notFound('Missing rowId in ADD_EMPTY_ROW response', `${newRow}`);
        return;
      }


      store.setState(() => ({
        ...state,
        activeRowId: rowId,
        activeCell: {
          rowId,
          columnId: firstColumn.fieldName,
        },
      }));
    } catch (e) {
      this.err.handle(e, 'NavigationManager.addEmptyRowAndActivate');
    }
  }

  private editableColumnsForRow(
    table: TableState['table'],
    row: Row,
  ): ReturnType<typeof table.getActiveCollectionColumns> {
    const disabledCols = Object.entries(row.getVisibilityCondition() ?? {})
      .filter(([, value]) => value === false)
      .map(([key]) => key);

    return table
      .getActiveCollectionColumns()
      .filter(
        (c) =>
          !c.hidden &&
          c.editable !== false &&
          !disabledCols.includes(c.fieldName) &&
          c.fieldName !== 'index' &&
          c.fieldType !== 'index' &&
          c.fieldType !== 'static',
      );
  }

  jumpActiveCellRowEdge(cmd: {
    tableKey: string;
    rowId: number;
    columnId: string;
    edge: 'start' | 'end';
  }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const { table } = store.getState();
    const row = table.getRow(cmd.rowId);
    if (!row) return;

    const columns = this.editableColumnsForRow(table, row);
    if (columns.length === 0) return;

    const targetColumn =
      cmd.edge === 'start'
        ? columns[0]
        : columns[columns.length - 1];

    store.setState((prev) => ({
      ...prev,
      activeRowId: cmd.rowId,
      activeCell: { rowId: cmd.rowId, columnId: targetColumn.fieldName },
    }));
  }

  jumpActiveCellGridCorner(cmd: {
    tableKey: string;
    corner: 'first' | 'last';
  }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const { table } = store.getState();
    const index = this.getUiRowIndex();
    const orderedIds = index.getOrderedIds();
    if (orderedIds.length === 0) return;

    const rowId =
      cmd.corner === 'first'
        ? orderedIds[0]
        : orderedIds[orderedIds.length - 1];
    const row = table.getRow(rowId);
    if (!row || row.rowState.value === 'Delete') return;

    const columns = this.editableColumnsForRow(table, row);
    if (columns.length === 0) return;

    const targetColumn =
      cmd.corner === 'first'
        ? columns[0]
        : columns[columns.length - 1];

    store.setState((prev) => ({
      ...prev,
      activeRowId: rowId,
      activeCell: { rowId, columnId: targetColumn.fieldName },
    }));
  }

  async moveActiveCellVertical(cmd: {
    store: string;
    tableKey: string;
    rowId: number;
    columnId: string;
    direction: 'up' | 'down';
  }): Promise<void> {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const { table } = store.getState();
    if (!table) return;

    // PR-99: O(1) neighbor from ordered SparseRowIndex (filter/sort already applied).
    const index = this.getUiRowIndex();
    const nextId = index.neighbor(
      cmd.rowId,
      cmd.direction === 'down' ? 1 : -1,
    );
    if (nextId === undefined) {
      const view = this.getViewState();
      if (cmd.direction === 'down' && view?.pagination.canNext) {
        void this.dispatch({
          type: 'CHANGE_PAGE',
          store: cmd.store,
          tableKey: cmd.tableKey,
          page: view.pagination.page + 1,
        });
      } else if (cmd.direction === 'up' && view?.pagination.canPrev) {
        void this.dispatch({
          type: 'CHANGE_PAGE',
          store: cmd.store,
          tableKey: cmd.tableKey,
          page: view.pagination.page - 1,
        });
      }
      return;
    }

    const nextRow = table.getRow(nextId);
    if (!nextRow || nextRow.rowState.value === 'Delete') return;

    await this.fetchVisibilityCondition(cmd, nextRow);

    store.setState(prev => ({
      ...prev,
      activeRowId: nextId,
      activeCell: { rowId: nextId, columnId: cmd.columnId },
    }));
  }
}