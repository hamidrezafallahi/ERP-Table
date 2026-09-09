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

    const columns = table.getColumns();
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

    const { table } = store.getState();
    if (!table) return;

    // Full row order (not paginated view.rows) so VirtualList can navigate.
    const navigable = [...table.getRows()]
      .filter(r => r.rowState.value !== 'Delete')
      .sort(
        (a, b) =>
          (Number(a.getCell('index')?.getValue()) || 0) -
          (Number(b.getCell('index')?.getValue()) || 0),
      );
    const curIdx = navigable.findIndex(r => r.id.value === cmd.rowId);
    if (curIdx === -1) return;

    const nxtIdx = cmd.direction === 'down' ? curIdx + 1 : curIdx - 1;
    if (nxtIdx < 0 || nxtIdx >= navigable.length) {
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

    const nextRow = navigable[nxtIdx];
    await this.fetchVisibilityCondition(cmd, nextRow);

    store.setState(prev => ({
      ...prev,
      activeRowId: nextRow.id.value,
      activeCell: { rowId: nextRow.id.value, columnId: cmd.columnId },
    }));
  }
}