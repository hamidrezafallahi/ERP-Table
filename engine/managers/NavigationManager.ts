// engine/managers/NavigationManager.ts

import {
  Actor,
  ApplyDynamicProjectionCommand,
} from '../../application/commands';
import { TableRepository } from '../../application/ports/TableRepository';
import { TableAppService } from '../../application/TableAppService';
import { Row } from '../../domain/entities/Row';
import { EngineErrorHandler } from '../EngineErrorHandler';
import { TableStore } from '../tableStore';
import {
  TableState,
  TableViewState,
} from '../type';

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
    private readonly dispatch: (cmd: any) => Promise<void>,
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
      .getColumns()
      .find(c => c.editable && c.fieldName !== 'index' && !c.hidden);

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

    const columns = table.getColumns();
    const cellDependency = new Set<string>();

    columns
      .filter(
        col =>
          col.dynamicSource?.dependsOn && col.dynamicSource.dependsOn.length > 0,
      )
      .forEach(col =>
        col.dynamicSource?.dependsOn.forEach((dep: string) =>
          cellDependency.add(dep),
        ),
      );

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
      .getColumns()
      .filter(
        c =>
          !c.hidden &&
          c.editable &&
          !disabledCols.includes(c.fieldName) &&
          c.fieldName !== 'index' &&
          c.fieldType !== 'static',
      );

    const currentColIndex = columns.findIndex(c => c.fieldName === cmd.columnId);
    if (currentColIndex === -1) return;

    const nextColIndex =
      cmd.direction === 'next' ? currentColIndex + 1 : currentColIndex - 1;
    const nextColumn = columns[nextColIndex];

    // حرکت در همان سطر
    if (nextColumn !== undefined) {
      store.setState(() => ({
        ...state,
        activeCell: { rowId: cmd.rowId, columnId: nextColumn.fieldName },
      }));
      await this.repo.save(cmd.store, store.getState().table);
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
        await this.repo.save(cmd.tableKey, store.getState().table);
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
        await this.repo.save(cmd.tableKey, store.getState().table);
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


      const rowId = (newRow as any).rowId?.value;

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

  async moveActiveCellVertical(cmd: {
    store: string;
    tableKey: string;
    rowId: number;
    columnId: string;
    direction: 'up' | 'down';
  }): Promise<void> {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const view = this.getViewState();
    if (!view) return;

    const visibleRows = view.rows;
    const currentIndex = visibleRows.findIndex(r => r.id === cmd.rowId);
    const nextIndex =
      cmd.direction === 'down' ? currentIndex + 1 : currentIndex - 1;

    // pre-fetch visibility برای سطر بعدی (قبل از setState)
    if (nextIndex >= 0 && nextIndex < visibleRows.length) {
      const nextRow = store
        .getState()
        .table.getRows()
        .find(r => r.id.value === visibleRows[nextIndex].id);
      if (nextRow) {
        await this.fetchVisibilityCondition(cmd, nextRow);
      }
    }

    store.setState(prev => {
      const currentView = this.getViewState();
      if (!currentView) return prev;

      const rows = currentView.rows;
      const curIdx = rows.findIndex(r => r.id === cmd.rowId);
      if (curIdx === -1) return prev;

      const nxtIdx =
        cmd.direction === 'down' ? curIdx + 1 : curIdx - 1;

      if (nxtIdx >= 0 && nxtIdx < rows.length) {
        const nextRow = rows[nxtIdx];
        return {
          ...prev,
          activeRowId: nextRow.id,
          activeCell: { rowId: nextRow.id, columnId: cmd.columnId },
        };
      }

      const isAtLastRow =
        cmd.direction === 'down' && curIdx === rows.length - 1;
      const isAtFirstRow = cmd.direction === 'up' && curIdx === 0;

      if (
        (isAtLastRow && currentView.pagination.canNext) ||
        (isAtFirstRow && currentView.pagination.canPrev)
      ) {
        return { ...prev, activeCell: null };
      }

      return prev;
    });

    // تغییر صفحه بعد از setState
    const currentView = this.getViewState();
    if (!currentView) return;

    const active = currentView.activeCell;

    if (!active && cmd.direction === 'down' && currentView.pagination.canNext) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        tableKey: cmd.tableKey,
        page: currentView.pagination.page + 1,
        store: cmd.store,
      }).then(() => {
        const newView = this.getViewState();
        if (!newView || newView.rows.length === 0) return;
        this.setActiveCell({
          tableKey: cmd.tableKey,
          rowId: newView.rows[0].id,
          columnId: cmd.columnId,
        });
      });
    }

    if (!active && cmd.direction === 'up' && currentView.pagination.canPrev) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        tableKey: cmd.tableKey,
        page: currentView.pagination.page - 1,
        store: cmd.store,
      }).then(() => {
        const newView = this.getViewState();
        if (!newView || newView.rows.length === 0) return;
        this.setActiveCell({
          tableKey: cmd.tableKey,
          rowId: newView.rows[newView.rows.length - 1].id,
          columnId: cmd.columnId,
        });
      });
    }
  }
}