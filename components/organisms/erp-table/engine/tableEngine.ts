// engine/TableEngine.ts

import {
  Actor,
  ApplyDynamicProjectionCommand,
  TableCommand,
} from '../application/commands';
import { TableRepository } from '../application/ports/TableRepository';
import { TableAppService } from '../application/TableAppService';
import { Row } from '../domain/entities/Row';
import { Table } from '../domain/entities/Table';
import {
  CellValue,
  ColumnId,
  RowId,
  RowStateEnum,
  TableActions,
} from '../domain/value-objects';
import {
  ConsoleAuditLogger,
} from '../infrastructure/Repositories/consoleAuditLogger';
import { IRow } from '../ui/type';
import { TableStore } from './tableStore';
import {
  CellError,
  TableSnapShot,
  TableState,
  TableViewState,
  TCell,
} from './type';

export class TableEngine {
  private tables = new Map<string, TableStore<TableState>>();
  public errors = new Map<string, CellError>();
  constructor(
    private readonly app: TableAppService,
    private readonly repo: TableRepository,
    private readonly actor: Actor,
    private readonly audit: ConsoleAuditLogger,
  ) { }

  private async registerTable(cmd: { store: string, table: Table }) {
    const { store, table } = cmd;
    if (this.tables.has(table.id)) return;
    const tableStore = new TableStore({
      table,
      expandedRows: {},
      selectedRows: {},
      activeRowId: null,
      activeCell: null,
      rangeAnchorRowId: null,
      action: null
    });
    this.tables.set(table.id, tableStore);
    await this.repo.save(store, table);
  }
  private selectFromActiveToLast(cmd: {
    tableKey: string;
    anchorRowId: number;
  }) {
    const store = this.getStore(cmd.tableKey);
    store.setState(prev => {
      const rows = prev.table.getVisibleRows(); // فقط ردیف‌های صفحه فعلی

      const startIdx = rows.findIndex(r => r.id.value === cmd.anchorRowId);
      if (startIdx === -1) return prev;

      // از سطر فعال تا **آخرین ردیف صفحه فعلی**
      const nextSelected: Record<number, true> = { ...prev.selectedRows };

      for (let i = startIdx; i < rows.length; i++) {
        nextSelected[rows[i].id.value] = true;
      }

      return {
        ...prev,
        selectedRows: nextSelected,
        rangeAnchorRowId: cmd.anchorRowId,
      };
    });
  }
  private async deleteTable(cmd: {
    store: string, tableKey: string
  }) {
    const { store, tableKey } = cmd

    await this.repo.delete(store, tableKey);
    this.tables.delete(tableKey);
  }
  private disposeTable(cmd: { store: string, tableKey: string }) {
    const { store, tableKey } = cmd
    this.repo.delete(store, tableKey)
    this.tables.delete(tableKey);

  }
  private async resetTable(cmd: {
    store: string;
    tableKey: string;
  }) {
    const { store, tableKey } = cmd;

    const tableStore = this.getStore(tableKey);
    if (!tableStore) {
      this.audit.log({
        type: 'ERROR',
        message: "Table  is not registered",
        payload: tableKey
      });
      return null
    }

    const freshTable = await this.repo.getById(store, tableKey);

    if (!freshTable) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be reloaded`,
        payload: tableKey
      });
      return null
    }
    tableStore.setState(prev => ({
      ...prev,
      table: freshTable,
      expandedRows: {},
      selectedRows: {},
      activeRowId: null,
      activeCell: null,
      rangeAnchorRowId: null,
    }));
  }
  private getStore(tableKey: string): TableStore<TableState> {
    const store = this.tables.get(tableKey);
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be found`,
        payload: tableKey
      });
      return null
    }
    return store;
  }
  private async moveActiveCell(cmd: {
    store: string;
    tableKey: string;
    rowId: number;
    columnId: string;
    direction: 'next' | 'prev';
  }) {
    const store = this.getStore(cmd.tableKey);
    const state = await store.getState();
    const table = state.table;

    // 1. پیدا کردن ستون‌های قابل نمایش و قابل ویرایش
    const disabledCols = Object.entries(table.getRow(cmd.rowId).getVisibilityCondition())
      .filter(([, value]) => value === false)
      .map(([key]) => key);

    const columns = table
      .getColumns()
      .filter(c => !c.hidden && c.editable && !disabledCols.includes(c.id) && c.id !== 'index');

    const currentColIndex = columns.findIndex(c => c.id === cmd.columnId);
    if (currentColIndex === -1) return;

    // 2. حرکت به ستون قبلی یا بعدی در همان سطر
    const nextColIndex = cmd.direction === 'next' ? currentColIndex + 1 : currentColIndex - 1;
    const nextColumn = columns[nextColIndex];

    // 3. اگر در همان سطر ستون بعدی وجود دارد → فقط ستون را تغییر بده
    if (nextColumn !== undefined) {
      store.setState(() => ({
        ...state,
        activeCell: {
          rowId: cmd.rowId,
          columnId: nextColumn.id,
        },
      }));
      await this.repo.save(cmd.store, store.getState().table);
      return;
    }

    // 4. رسیدیم به آخرین ستون سطر جاری → باید به سطر بعدی/قبلی برویم
    const allRows = table.getRows();
    const currentRowIndex = allRows.findIndex(r => r.id.value === cmd.rowId);
    const isLastRow = currentRowIndex === allRows.length - 1;
    const isFirstRow = currentRowIndex === 0;

    // 5. حرکت به سطر بعدی (direction === 'next')
    if (cmd.direction === 'next') {
      // اگر آخرین سطر است → سطر خالی اضافه کن
      if (isLastRow) {
        const newRow = await this.app.execute({
          type: 'ADD_EMPTY_ROW',
          store: cmd.store,
          tableKey: cmd.tableKey,
          autoActivate: true,
        }, this.actor);

        const firstColumn = columns[0];
        store.setState(() => ({
          ...state,
          activeRowId: newRow['rowId'].value,
          activeCell: {
            rowId: newRow['rowId'].value,
            columnId: firstColumn.id,
          },
        }));
        return;
      }

      // سطر بعدی را پیدا کن (رد شدن از سطرهای حذف شده)
      let nextValidRowIndex = -1;
      for (let offset = 1; currentRowIndex + offset < allRows.length; offset++) {
        const candidateRow = allRows[currentRowIndex + offset];
        if (candidateRow.rowState.value !== 'Delete') {
          nextValidRowIndex = currentRowIndex + offset;
          break;
        }
      }

      // اگر سطر معتبری پیدا شد → برو به اولین ستون آن سطر
      if (nextValidRowIndex !== -1) {
        const nextRowId = allRows[nextValidRowIndex].id.value;
        const firstColumn = columns[0];
        store.setState(() => ({
          ...state,
          activeRowId: nextRowId,
          activeCell: {
            rowId: nextRowId,
            columnId: firstColumn.id,
          },
        }));
        await this.repo.save(cmd.tableKey, store.getState().table);
        return;
      }

      // هیچ سطر معتبری بعد از سطر جاری وجود ندارد → سطر خالی اضافه کن
      const newRow = await this.app.execute({
        type: 'ADD_EMPTY_ROW',
        store: cmd.store,
        tableKey: cmd.tableKey,
        autoActivate: true,
      }, this.actor);

      const firstColumn = columns[0];
      store.setState(() => ({
        ...state,
        activeRowId: newRow['rowId'].value,
        activeCell: {
          rowId: newRow['rowId'].value,
          columnId: firstColumn.id,
        },
      }));
      return;
    }

    // 6. حرکت به سطر قبلی (direction === 'prev')
    if (cmd.direction === 'prev') {
      // اگر اولین سطر است → هیچ کاری نکن (یا می‌توانی رفتار دیگری تعریف کنی)
      if (isFirstRow) {
        return;
      }

      // سطر قبلی را پیدا کن (رد شدن از سطرهای حذف شده)
      let prevValidRowIndex = -1;
      for (let offset = 1; currentRowIndex - offset >= 0; offset++) {
        const candidateRow = allRows[currentRowIndex - offset];
        if (candidateRow.rowState.value !== 'Delete') {
          prevValidRowIndex = currentRowIndex - offset;
          break;
        }
      }

      // اگر سطر معتبری پیدا شد → برو به آخرین ستون قابل ویرایش آن سطر
      if (prevValidRowIndex !== -1) {
        const prevRowId = allRows[prevValidRowIndex].id.value;
        const lastColumn = columns[columns.length - 1];
        store.setState(() => ({
          ...state,
          activeRowId: prevRowId,
          activeCell: {
            rowId: prevRowId,
            columnId: lastColumn.id,
          },
        }));
        await this.repo.save(cmd.tableKey, store.getState().table);
        return;
      }

      // اگر سطر معتبری پیدا نشد → هیچ کاری نکن (یا می‌توانی رفتار دیگری تعریف کنی)
      return;
    }
  }
  private async moveActiveCellVertical(cmd: {
    store: string;
    tableKey: string;
    rowId: number;
    columnId: string;
    direction: 'up' | 'down';
  }) {
    const store = this.getStore(cmd.tableKey);
    const view = this.getViewState(cmd.tableKey);
    const visibleRows = view.rows;
    const currentIndex = visibleRows.findIndex(r => r.id === cmd.rowId);
    const nextIndex = cmd.direction === 'down' ? currentIndex + 1 : currentIndex - 1;
    // حرکت داخل همان صفحه
    if (nextIndex >= 0 && nextIndex < visibleRows.length) {
      const nextRow = visibleRows[nextIndex];
      const row = store.getState().table.getRows().find(r => r.id.value === nextRow.id);
      await this.fetchVisibilityCondition(cmd, row);
    }
    store.setState(prev => {
      const view = this.getViewState(cmd.tableKey);
      if (!view) return prev;

      const { pagination } = view;

      // ✅ این rows الان از قبل بر اساس index مرتب شده‌اند
      const visibleRows = view.rows;

      const currentIndex = visibleRows.findIndex(r => r.id === cmd.rowId);
      if (currentIndex === -1) return prev;

      const nextIndex =
        cmd.direction === 'down'
          ? currentIndex + 1
          : currentIndex - 1;

      // ------------------------------
      // حرکت داخل همان صفحه
      // ------------------------------
      if (nextIndex >= 0 && nextIndex < visibleRows.length) {
        const nextRow = visibleRows[nextIndex];
        return {
          ...prev,
          activeRowId: nextRow.id,
          activeCell: {
            rowId: nextRow.id,
            columnId: cmd.columnId,
          },
        };
      }

      // ------------------------------
      // رسیدن به مرز صفحه
      // ------------------------------
      const isAtLastRow =
        cmd.direction === 'down' &&
        currentIndex === visibleRows.length - 1;

      const isAtFirstRow =
        cmd.direction === 'up' &&
        currentIndex === 0;

      if (isAtLastRow && pagination.canNext) {
        return {
          ...prev,
          activeCell: null, // بعد از تغییر صفحه ست می‌شود
        };
      }

      if (isAtFirstRow && pagination.canPrev) {
        return {
          ...prev,
          activeCell: null,
        };
      }

      // هیچ حرکتی ممکن نیست
      return prev;
    });

    // ---------------------------------------
    // بعد از setState → بررسی تغییر صفحه
    // ---------------------------------------
    const currentView = this.getViewState(cmd.tableKey);
    if (!currentView) return;

    const active = currentView.activeCell;

    // ------------------------------
    // رفتن به صفحه بعد
    // ------------------------------
    if (
      !active &&
      cmd.direction === 'down' &&
      currentView.pagination.canNext
    ) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        tableKey: cmd.tableKey,
        page: currentView.pagination.page + 1,
        store: cmd.store,
      }).then(() => {
        const newView = this.getViewState(cmd.tableKey);
        if (!newView || newView.rows.length === 0) return;
        const firstRowId = newView.rows[0].id;

        this.setActiveCell({
          tableKey: cmd.tableKey,
          rowId: firstRowId,
          columnId: cmd.columnId,
        });
      });
    }

    // ------------------------------
    // رفتن به صفحه قبل
    // ------------------------------
    if (
      !active &&
      cmd.direction === 'up' &&
      currentView.pagination.canPrev
    ) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        tableKey: cmd.tableKey,
        page: currentView.pagination.page - 1,
        store: cmd.store,
      }).then(() => {
        const newView = this.getViewState(cmd.tableKey);
        if (!newView || newView.rows.length === 0) return;

        const lastRowId =
          newView.rows[newView.rows.length - 1].id;

        this.setActiveCell({
          tableKey: cmd.tableKey,
          rowId: lastRowId,
          columnId: cmd.columnId,
        });
      });
    }
  }
  private activateFirstCell(cmd: {
    tableKey: string;
    rowId: number;
  }) {
    const store = this.getStore(cmd.tableKey);
    const state = store.getState();
    const table = state.table;

    const firstEditable = table
      .getColumns()
      .find(c => c.editable && c.id !== 'index' && !c.hidden);

    if (!firstEditable) return;

    store.setState(() => ({
      ...state,
      activeCell: {
        rowId: cmd.rowId,
        columnId: firstEditable.id,
      },
    }));
  }
  private async setActiveCell(cmd: {
    tableKey: string
    rowId: number
    columnId: string
  }) {
    const store = this.getStore(cmd.tableKey);
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
        activeCell: {
          rowId: cmd.rowId,
          columnId: cmd.columnId,
        },
      };
    });
  }
  private async setActiveRow(cmd: {
    store: string
    tableKey: string
    rowId: number
  }) {
    const store = this.getStore(cmd.tableKey);
    const { table } = store.getState()
    if (!table) return null;
    const row = table.getRows().find(r => r.id.value === cmd.rowId);

    await this.fetchVisibilityCondition(cmd, row)
    store.setState(prev => {
      if (prev.activeRowId === cmd.rowId) {
        return prev;
      }
      return {
        ...prev,
        activeRowId: cmd.rowId,
        activeCell: null,
        rangeAnchorRowId: cmd.rowId,
        // selectedRows: { [cmd.rowId]: true },
      };
    });
  }
  ///////////////////////////////////////////////////////////////////////////////////////
  private async fetchVisibilityCondition(cmd: {
    store: string
    tableKey: string
    rowId: number
  }, row: Row) {
    const store = this.getStore(cmd.tableKey);
    const { table } = store.getState()
    if (!table) return null;

    const Columns = table.getColumns()
    const cellDependency = new Set<string>()

    Columns.filter(col => col.dynamicValue?.dependsOn && col.dynamicValue?.dependsOn.length > 0)
      .map(col => col.dynamicValue?.dependsOn.map(depend => cellDependency.add(depend)))
    for (const col of cellDependency) {
      const val = row.getCell(col).getValue().value
      if (val) {
        const command: ApplyDynamicProjectionCommand = {
          type: "APPLY_DYNAMIC_PROJECTION",
          store: cmd.store,
          tableKey: cmd.tableKey,
          rowId: cmd.rowId,
          columnId: col,
        }
        await this.app.execute(command, this.actor);
      }
    }
    const updated = await this.repo.getById(cmd.store, cmd.tableKey);
    const currentStore = this.getStore(cmd.tableKey);
    if (currentStore && updated) {
      const prev = currentStore.getState();
      currentStore.setState(() => ({
        ...prev,
        table: updated,
      }));
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////
  private setSelectRow(cmd: {
    tableKey: string
    rowId: number
  }) {
    const store = this.getStore(cmd.tableKey);
    store.setState(prev => {
      const isSelected = !!prev.selectedRows[cmd.rowId];
      return {
        ...prev,
        selectedRows: isSelected ? {} : { [cmd.rowId]: true },
        rangeAnchorRowId: isSelected ? null : cmd.rowId,

      };
    });
  }
  private moveVerticalSelectedRows(cmd: {
    tableKey: string;
    direction: 'down' | 'up';
  }) {
    const store = this.getStore(cmd.tableKey);

    store.setState(prev => {
      const table = prev.table;
      const selectedMap = prev.selectedRows;

      const allRows = table.getRows();

      // مرتب بر اساس index
      const sortedRows = [...allRows].sort((a, b) =>
        (a.getCell("index")?.getValue()?.value as number) -
        (b.getCell("index")?.getValue()?.value as number)
      );

      const selectedRows = sortedRows.filter(r => selectedMap[r.id.value]);
      if (selectedRows.length === 0) return prev;

      if (cmd.direction === 'up') {
        // از اولین سطر شروع می‌کنیم
        for (const row of selectedRows) {
          const idx = sortedRows.findIndex(r => r.id.value === row.id.value);
          if (idx === 0) continue; // بالاترین ردیف

          const upperRow = sortedRows[idx - 1];

          // swap index
          const rowIndex = row.getCell("index")?.getValue()?.value as number;
          const upperIndex = upperRow.getCell("index")?.getValue()?.value as number;

          row.changeCell(new ColumnId("index"), new CellValue(upperIndex));
          upperRow.changeCell(new ColumnId("index"), new CellValue(rowIndex));

          // swap position in array to prevent double-swapping
          sortedRows[idx - 1] = row;
          sortedRows[idx] = upperRow;
        }
      }

      if (cmd.direction === 'down') {
        // از آخرین سطر شروع می‌کنیم تا تداخل نداشته باشیم
        for (let i = selectedRows.length - 1; i >= 0; i--) {
          const row = selectedRows[i];
          const idx = sortedRows.findIndex(r => r.id.value === row.id.value);
          if (idx === sortedRows.length - 1) continue; // پایین‌ترین ردیف

          const lowerRow = sortedRows[idx + 1];

          const rowIndex = row.getCell("index")?.getValue()?.value as number;
          const lowerIndex = lowerRow.getCell("index")?.getValue()?.value as number;

          row.changeCell(new ColumnId("index"), new CellValue(lowerIndex));
          lowerRow.changeCell(new ColumnId("index"), new CellValue(rowIndex));

          sortedRows[idx] = lowerRow;
          sortedRows[idx + 1] = row;
        }
      }

      return {
        ...prev,
        table,
      };
    });
  }
  private moveVerticalActiveRow(cmd: {
    tableKey: string;
    direction: 'down' | 'up';
  }) {
    try {
      const store = this.getStore(cmd.tableKey);
      store.setState(prev => {
        const table = prev.table;
        const allRows = table.getRows();
        const activeRow = allRows.find(r => r.id.value == prev.activeRowId);
        if (!activeRow) return prev;

        const sortedRows = [...allRows].sort((a, b) =>
          (a.getCell("index")?.getValue()?.value as number) -
          (b.getCell("index")?.getValue()?.value as number)
        );

        if (cmd.direction === 'up') {
          const idx = sortedRows.findIndex(r => r.id.value === prev.activeRowId);
          if (idx !== 0) {
            const upperRow = sortedRows[idx - 1];
            const rowIndex = activeRow.getCell("index")?.getValue()?.value as number;
            const upperIndex = upperRow.getCell("index")?.getValue()?.value as number;

            activeRow.changeCell(new ColumnId("index"), new CellValue(upperIndex));
            upperRow.changeCell(new ColumnId("index"), new CellValue(rowIndex));
            sortedRows[idx - 1] = activeRow;
            sortedRows[idx] = upperRow;
            // const view = this.getViewState(cmd.tableKey);
            // const activeRowInViewIndex = sortedRows.findIndex(r => r.id.value == activeRow.id.value) + 1
            //  if (view.pagination.canPrev && activeRowInViewIndex<=view.pagination.page-1 * view.pagination.pageSize) {
            //   this.dispatch({
            //     type: 'CHANGE_PAGE',
            //     tableKey: cmd.tableKey,
            //     page: view.pagination.page - 1,
            //     store: cmd.tableKey,
            //   })
            // }
          }
        }

        if (cmd.direction === 'down') {
          const idx = sortedRows.findIndex(r => r.id.value === prev.activeRowId);
          if (idx !== sortedRows.length - 1) {
            const lowerRow = sortedRows[idx + 1];
            const rowIndex = activeRow.getCell("index")?.getValue()?.value as number;
            const lowerIndex = lowerRow.getCell("index")?.getValue()?.value as number;
            activeRow.changeCell(new ColumnId("index"), new CellValue(lowerIndex));
            lowerRow.changeCell(new ColumnId("index"), new CellValue(rowIndex));
            sortedRows[idx] = lowerRow;
            sortedRows[idx + 1] = activeRow;
            // const view = this.getViewState(cmd.tableKey);
            // const activeRowInViewIndex = sortedRows.findIndex(r => r.id.value == activeRow.id.value) + 1
            // console.log(activeRowInViewIndex, view.pagination.page * view.pagination.pageSize, view.pagination.canPrev, view.pagination.canNext)
            // if (view.pagination.canNext && activeRowInViewIndex>view.pagination.page * view.pagination.pageSize) {
            //   this.dispatch({
            //     type: 'CHANGE_PAGE',
            //     tableKey: cmd.tableKey,
            //     page: view.pagination.page + 1,
            //     store: cmd.tableKey,
            //   })
            // }
          }
        }
        return {
          ...prev,
          table,
        };
      });
    } catch (error) {
      console.log(error);
    }
  }
  private setRowExpanded(cmd: {
    tableKey: string, rowId: number, value: boolean
  }) {
    const { rowId, tableKey, value } = cmd
    const store = this.getStore(tableKey);
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `setRowExpanded store is not found`,
        payload: tableKey
      });
      return null
    }
    const state = store.getState();
    const key = String(rowId);
    if (!!state.expandedRows[rowId] === value) return;

    store.setState(() => ({
      ...state,
      expandedRows: {
        ...state.expandedRows,
        [key]: value,
      },
    }));
  }
  private toggleRowExpanded(cmd: {
    tableKey: string, rowId: number
  }) {
    const { rowId, tableKey } = cmd
    const key = String(rowId);
    const store = this.getStore(tableKey);
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `toggleRowExpanded store is not found`,
        payload: tableKey
      });
      return null
    }
    const state = store.getState();
    const next = !state.expandedRows[key];
    store.setState(() => ({
      ...state,
      expandedRows: {
        ...state.expandedRows,
        [key]: next,
      },
    }));
  }
  private collapseAll(tableKey: string) {
    const store = this.getStore(tableKey);
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `collapseAll store is not found`,
        payload: tableKey
      });
      return null
    }
    const state = store.getState();
    if (!state.expandedRows || Object.keys(state.expandedRows).length === 0) return;

    store.setState(() => ({
      ...state,
      expandedRows: {},
    }));
  }
  private toggleRowSelection(cmd: {
    tableKey: string;
    rowId: number;
  }) {
    const store = this.getStore(cmd.tableKey);
    store.setState(prev => {
      const isSelected = !!prev.selectedRows[cmd.rowId];

      const nextSelected = { ...prev.selectedRows };

      if (isSelected) {
        delete nextSelected[cmd.rowId];
      } else {
        nextSelected[cmd.rowId] = true;
      }

      return {
        ...prev,
        selectedRows: nextSelected,
      };
    });
  }
  private toggleSelectAllRows(cmd: { tableKey: string }) {
    const store = this.getStore(cmd.tableKey);
    const allRows = store.getState().table.getRows()
    const allSelected = Object.keys(store.getState().selectedRows).length === allRows.length;
    store.setState(prev => {
      if (allSelected) {
        return {
          ...prev,
          selectedRows: {},
        };
      } else {
        const nextSelected: Record<number, true> = {};
        allRows.forEach(row => {
          nextSelected[row.id.value] = true;
        });
        return {
          ...prev,
          selectedRows: nextSelected,
        };
      }
    });
  }
  private deleteAll( tableKey: string  ) {
    const store = this.getStore(tableKey);
       const { table, selectedRows } = store.getState()
    Object.entries(selectedRows).map(([key]) => table.deleteRow(new RowId(Number(key))));
    store.setState(prev => {
        return {
          ...prev,
          selectedRows: {},
          table
        };
    });
  }
  private toggleSelectPageRows(cmd: { tableKey: string }) {
    const store = this.getStore(cmd.tableKey);
    const pageRows = store.getState().table.getVisibleRows();
    const selectedRows = store.getState().selectedRows;
    const allPageRowsSelected = pageRows.every(row => {
      const rowId = row.id.value; // یا row.id.value.toString() اگر کلیدها رشته هستند
      return selectedRows.hasOwnProperty(rowId);
    });



    store.setState(prev => {
      if (allPageRowsSelected) {
        return {
          ...prev,
          selectedRows: {},
        };
      } else {
        const nextSelected: Record<number, true> = {};
        pageRows.forEach(row => {
          nextSelected[row.id.value] = true;
        });
        return {
          ...prev,
          selectedRows: nextSelected,
        };
      }
    });
  }
  private selectRange(cmd: {
    tableKey: string
    rowId: number
  }) {
    const store = this.getStore(cmd.tableKey);
    store.setState(prev => {
      const anchor = prev.rangeAnchorRowId ?? prev.activeRowId;
      if (!anchor) return prev;

      const rows = prev.table.getVisibleRows();
      const startIndex = rows.findIndex(r => r.id.value === anchor);
      const endIndex = rows.findIndex(r => r.id.value === cmd.rowId);

      if (startIndex === -1 || endIndex === -1) return prev;

      const [from, to] =
        startIndex < endIndex
          ? [startIndex, endIndex]
          : [endIndex, startIndex];

      const nextSelected: Record<number, true> = {};

      for (let i = from; i <= to; i++) {
        nextSelected[rows[i].id.value] = true;
      }

      return {
        ...prev,
        selectedRows: nextSelected,
        rangeAnchorRowId: anchor,
      };
    });
  }
  private setTableAction(cmd: {
    tableKey: string
    action: TableActions
  }) {
    const store = this.getStore(cmd.tableKey);
    const { table, selectedRows, activeRowId } = store.getState()
    const Rows = Array.from(table.getRows().filter(r => r.rowState.value !== RowStateEnum.Deleted))
    const filteredRows = Rows.filter(row => {
      const rowId = row.id?.value;
      return selectedRows[rowId] === true;
    });
    switch (cmd.action) {
      case "copy":
      case "cut":
      case null:
        table.setTableAction(cmd.action)
        break;
      case "paste":
      case "pasteInsert":
        filteredRows.sort((a, b) => {
          const aIndex = Number(a.getCells().get("index")?.getValue()?.value ?? 0);
          const bIndex = Number(b.getCells().get("index")?.getValue()?.value ?? 0);
          return bIndex - aIndex;
        }).map(row => {
          table.addRow(row.id.value, cmd.action == "pasteInsert" ? activeRowId : undefined)
        })

        if (table.getTableAction() == "cut") {
          filteredRows.map(row => {
            table.deleteRow(row.id)
            this.setSelectRow(
              {
                tableKey: cmd.tableKey,
                rowId: row.id.value
              }
            )
          })
        }
        store.setState(prev => {
          return {
            ...prev,
            selectedRows: {},
          };
        });
        table.setTableAction(null)
        break;
      default:
        break;
    }

    store.setState(prev => {
      console.log(table)
      return {
        ...prev,
        table: table,
      };
    });


  }
  async dispatch(command: TableCommand) {
    switch (command.type) {
      case 'ACTIVE_CELL':
        this.setActiveCell(command);
        return;
      case 'ACTIVE_ROW':
        this.setActiveRow(command);
        return;
      case 'MOVE_ACTIVE_CELL':
        this.moveActiveCell(command);
        return;
      case 'MOVE_ACTIVE_CELL_VERTICAL':
        this.moveActiveCellVertical(command);
        return;
      case 'ACTIVATE_FIRST_CELL':
        this.activateFirstCell(command);
        return;
      case 'TABLE_REGISTERED':
        await this.registerTable(command);
        return;

      case 'TABLE_DELETED':
        await this.deleteTable(command);
        return;

      case 'ROW_EXPANDED':
        this.setRowExpanded(command);
        return;
      case 'TABLE_DISPOSED':
        this.disposeTable(command);
        return;
      case 'COLLAPSE_ALL_ROWS':
        this.collapseAll(command.tableKey);
        return;
      case 'ROWS_DELETED':
        this.deleteAll(command.tableKey);
        return;

      case 'ROW_EXPAND_TOGGLED':
        this.toggleRowExpanded(command);
        return;
      case 'TABLE_RESET':
        this.resetTable(command);
        return;
      case 'TOGGLE_SELECT_ALL_ROWS':
        this.toggleSelectAllRows(command);
        return;
      case 'TOGGLE_SELECT_PAGE_ROWS':
        this.toggleSelectPageRows(command);
        return;
      case 'ROW_SELECTION_TOGGLED':
        this.toggleRowSelection(command);
        return;
      case 'ROW_RANGE_SELECTED':
        this.selectRange(command);
        return;
      case 'ROW_SELECTED':
        this.setSelectRow(command);
        return;
      case 'SELECT_FROM_ACTIVE_TO_LAST':
        this.selectFromActiveToLast(command);
        return;
      case 'MOVE_VERTICAL_SELECTED_ROWS':
        this.moveVerticalSelectedRows(command);
        return;
      case 'MOVE_VERTICAL_ACTIVE_ROW':
        this.moveVerticalActiveRow(command);
        return;
      case 'SET_TABLE_ACTION':
        this.setTableAction(command);
        return;
      default:
        await this.app.execute(command, this.actor);
        const updated = await this.repo.getById(command.store, command.tableKey);
        const store = this.getStore(command.tableKey);
        const prev = store.getState();
        store.setState(() => ({
          ...prev,
          table: updated,
        }));

    }
  }
  getViewState(tableKey: string): TableViewState {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be founded at getViewState`,
        payload: tableKey
      });
      return null
    }
    const { table, expandedRows, activeCell, selectedRows } = store
    const pagination = table.getPagination();
    const totalRows = table.getRows().length;
    const totalPages = Math.max(
      1,
      Math.ceil(totalRows / pagination.pageSize)
    );


    return {
      // table,
      activeCell,
      selectedRows,
      rows: table.getVisibleRows()
        .sort((a, b) => {
          const aIndex = Number(a.getCells().get("index")?.getValue()?.value ?? 0);
          const bIndex = Number(b.getCells().get("index")?.getValue()?.value ?? 0);
          return aIndex - bIndex;
        })
        .map((row) => {
          const cells: Record<string, TCell> = {};
          const columns = table.getColumns();
          for (const col of columns) {
            const cell = row.getCells().get(col.id);
            cells[col.id] = {
              value: cell?.getValue()?.value ?? null,
              originalValue: cell?.getOriginalValue()?.value ?? null,
              display: cell?.getDisplay()?.value ?? null,
            };
          }
          return {
            id: row.id.value,
            rowState: row.rowState.value,
            changeFields: row.getChangeFields(),
            cells,
            isExpanded: !!expandedRows[row.id.value],
            moreDetails: row.moreDetails,
            visibilityCondition: row.visibilityCondition

          }
        }),
      deletedRows: [],
      columns: table.getColumns().map((col) => ({
        id: col.id,
        title: col.title,
        hidden: col.hidden,
        renderType: col.renderType,
        editable: col.editable,
        options: col.selectOptions,
        indexOptions: col.indexOptions,
        onChange: col.onChange,
        dynamicValue: col.dynamicValue,
        width: col.minWidth,
        style: col.style,
        popUpWidth: col.popUpWidth,
        dynamicSelectFilterOption:col.dynamicSelectFilterOption,
        labelValue: col.labelValue,
        className: col.className,
         enableDeleteButton:col.enableDeleteButton,
        enableExpandButton:col.enableExpandButton,
        enableMoveButton:col.enableMoveButton,
        enableOptionsButton:col.enableOptionsButton,
      })),
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalRows,
        totalPages,
        canPrev: pagination.page > 1,
        canNext: pagination.page < totalPages,
      },
      action: table.getTableAction()
    }
  }
  getAllRows(tableKey: string): IRow[] {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be founded at getViewState`,
        payload: tableKey
      });
      return null
    }
    const { table, expandedRows } = store
    return table.getRows()
      .sort((a, b) => {
        const aIndex = Number(a.getCells().get("index")?.getValue()?.value ?? 0);
        const bIndex = Number(b.getCells().get("index")?.getValue()?.value ?? 0);
        return aIndex - bIndex;
      }).map((row) => {
        const cells: Record<string, TCell> = {};
        const columns = table.getColumns();
        for (const col of columns) {
          const cell = row.getCells().get(col.id);

          cells[col.id] = {
            value: cell?.getValue()?.value ?? null,
            originalValue: cell?.getOriginalValue()?.value ?? null,
            display: cell?.getDisplay()?.value ?? null,
          };
        }
        return {
          id: row.id.value,
          rowState: row.rowState.value,
          changeFields: row.getChangeFields(),
          cells,
          isExpanded: !!expandedRows[row.id.value],
          moreDetails: row.moreDetails,
          visibilityCondition: row.visibilityCondition

        }
      })
  }
  getSnapShot(tableKey: string): TableSnapShot {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be founded at getViewState`,
        payload: tableKey
      });
      return null
    }
    const { table } = store
    return {
      table,
      rows: table.getRows().map(row => ({
        id: row.id.value,
        changeFields: row.getSnapshotChangeFields(),
        cells: Object.fromEntries(
          [...row.getCells()].map(([k, c]) => [k, c.getValue()?.value])
        ),
        rowState: row.rowState.value,
        moreDetails: row.moreDetails
      })),
    };

  }
  getExpandedRowData(tableKey: string, rowId: number) {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be founded at getViewState`,
        payload: tableKey
      });
      return null
    }
    const { table } = store
    if (!table) return null;
    const row = table.getRows().find(r => r.id.value === rowId);
    if (!row) return null;
    const rowValues: Record<string, unknown> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue().value;
    }
    return rowValues;
  }
  getActiveCell(tableKey: string) {
    const store = this.getStore(tableKey).getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Active cell is not found`,
        payload: tableKey
      });
      return null
    }

    return store.activeCell;
  }
  getActiveRow(tableKey: string) {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `store could not be founded at getActiveRow`,
        payload: tableKey
      });
      return null
    }
    return store.activeRowId;
  }
  getSelectedRows(tableKey: string): Record<number, boolean> {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `store could not be founded at getSelectedRows`,
        payload: tableKey
      });
      return null
    }
    return store.selectedRows;
  }
  getCell(tableKey: string, rowId: number, columnId: string) {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `store could not be founded at getCell`,
        payload: tableKey
      });
      return null
    }
    return store.table.getRow(rowId).getCell(columnId);
  }
  subscribeColumn<T = unknown>(
    tableKey: string,
    columnId: string,
    cb: (items: Array<{ id: number; rowNum: unknown; value: T }>) => void
  ) {
    const store = this.getStore(tableKey);
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `subscribeColumn store is not found`,
        payload: tableKey
      });
      return null
    }
    let prev = this.getAllRows(tableKey).filter(r => r.rowState !== RowStateEnum.Deleted).map(r => ({
      id: r.id,
      rowNum: r.cells['index']?.value,
      value: r.cells[columnId]?.value as T
    }));

    return store.subscribe(() => {
      const rows = this.getAllRows(tableKey);

      const next = rows.map(r => ({
        id: r.id,
        rowNum: r.cells['index']?.value,
        value: r.cells[columnId]?.value as T
      }));

      const changed =
        next.length !== prev.length ||
        next.some((item, i) =>
          item.id !== prev[i].id ||
          item.rowNum !== prev[i].rowNum ||
          item.value !== prev[i].value
        );

      if (changed) {
        prev = next;
        cb(next);
      }
    });
  }

  isActiveCell(
    tableKey: string,
    rowId: number,
    columnId: string
  ): boolean {
    try {
      const { activeCell } = this.getStore(tableKey).getState();
      return !!activeCell &&
        activeCell.rowId === rowId &&
        activeCell.columnId === columnId;
    } catch {
      return false;
    }
  }

  isSelectedRow(tableKey: string, rowId: number): boolean {
    try {
      const { selectedRows } = this.getStore(tableKey).getState();
      return !!selectedRows && !!selectedRows[rowId];
    } catch {
      return false;
    }
  }
  isCutRow(tableKey: string, rowId: number): boolean {
    try {
      const { selectedRows, table } = this.getStore(tableKey).getState();
      return selectedRows[rowId] && table.getTableAction() === "cut";
    } catch {
      return false;
    }
  }
  isActiveRow(
    tableKey: string,
    rowId: number,
  ): boolean {

    try {
      const { activeRowId } = this.getStore(tableKey).getState();
      return !!activeRowId &&
        activeRowId === rowId
    } catch {
      return false;
    }
  }
  subscribe(tableKey: string, cb: () => void) {
    const table = this.getStore(tableKey).subscribe(cb);
    try {
      return table
    } catch {
      return null;
    }
  }
}





// private validateCell(value: any, schema: ColumnSchema, caption: string,rowId: number): CellError | undefined {
//   const rules = schema?.rules ?? [];
//   if (!rules.length) return undefined;
//   for (const rule of rules) {
//     const v = rule.transform ? rule.transform(value) : value;
//     // Required
//     if (rule.required) {
//       const isEmpty =
//         v === null ||
//         v === undefined ||
//         (typeof v === "string" && v.trim() === "") ||
//         (Array.isArray(v) && v.length === 0);
//       if (isEmpty) return  {caption,rowId,message:rule.message ?? `${schema.title || caption} الزامی است`} ;
//     }

//     // Pattern
//     if (rule.pattern) {
//       const reg = typeof rule.pattern === "string" ? new RegExp(rule.pattern) : rule.pattern;
//       if (!reg.test(String(v))) return {caption,rowId,message:rule.message ?? `${schema.title || caption} فرمت نامعتبر دارد`}  ;
//     }

//     // Type-based
//     switch (rule.type) {
//       case "number":
//       case "integer":
//       case "float": {
//         const n = Number(v);

//         if (Number.isNaN(n)) return {caption,rowId,message:rule.message ?? `${schema.title || caption} باید عددی باشد`} ;
//         if (rule.min != null && n < rule.min) return {caption,rowId,message:rule.message ?? `${schema.title || caption} باید ≥ ${rule.min} باشد`} ;
//         if (rule.max != null && n > rule.max) return {caption,rowId,message:rule.message ?? `${schema.title || caption} باید ≤ ${rule.max} باشد`}  ;
//         if (rule.type === "integer" && !Number.isInteger(n)) return {caption,rowId,message:rule.message ?? `${schema.title || caption} باید عدد صحیح باشد`};
//         break;
//       }
//       case "boolean":
//         if (typeof v !== "boolean") return {caption,rowId,message:rule.message ?? `${schema.title || caption} باید بولی باشد`} ;
//         break;
//       case "email": {
//         const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!reg.test(String(v))) return {caption,rowId,message:rule.message ?? `${schema.title || caption} ایمیل معتبر نیست`};
//         break;
//       }
//       case "url": {
//         try {
//           new URL(v);
//         } catch {
//           return {caption,rowId,message:rule.message ?? `${schema.title || caption} باید URL معتبر باشد`};
//         }
//         break;
//       }
//       case "date": {
//         const d = new Date(v);
//         if (isNaN(d.getTime())) return {caption,rowId,message:rule.message ?? `${schema.title || caption} تاریخ معتبر نیست`};
//         break;
//       }
//       case "enum":
//         if (rule.enum && !rule.enum.includes(v))
//           return {caption,rowId,message:rule.message ??  `${schema.title || caption} مقدار نامعتبر دارد`};
//         break;
//       default:
//         break;
//     }
//     if (typeof v === "string") {
//       if (rule.len != null && v.length !== rule.len) return {caption,rowId,message:rule.message ??  `${schema.title || caption} باید ${rule.len} کاراکتر باشد`};
//       if (rule.min != null && v.length < rule.min) return {caption,rowId,message:rule.message ??`${schema.title || caption} باید حداقل ${rule.min} کاراکتر باشد`};
//       if (rule.max != null && v.length > rule.max) return {caption,rowId,message:rule.message ??`${schema.title || caption} باید حداکثر ${rule.max} کاراکتر باشد`};
//     }
//     if (rule.validator) {
//       let customError: string[] | undefined;
//       rule.validator(rule, v, (err?: string[]) => (customError = err));
//       if (customError && customError.length) return {caption,rowId,message:rule.message ?? customError[0]};
//     }
//     if (rule.asyncValidator) {
//       // async validator‌ها رو اینجا فقط ignore می‌کنیم (درصورت نیاز async handle کن)
//     }
//   }
//   return undefined;
// }
// validation(tableKey: string, cb: ValidationCallback): void {
//   const store = this.getStore(tableKey)
//   const table = store.getState().table;
//   try {
//     this.getAllRows(tableKey).forEach((row: IRow, rowIndex: number) => {
//       Object.entries(row.cells).forEach(([columnId, cell]: [string, TCell]) => {

//         const cellId = `row-${rowIndex}-${columnId}`;
//         const schema = table.getColumnSchema(new ColumnId(columnId))
//         const error = this.validateCell(cell.value as any, schema, schema.title,row.id);
//         if (error) {
//           this.errors.set(cellId, error);
//         } else {
//           this.errors.delete(cellId);
//         }
//       });
//     });
//      cb(
//       {
//         valid: this.errors.size === 0,
//         errors: this.errors,
//         data: this.getAllRows(tableKey)
//       }
//     );
//     store.setState(prev => {
//       return {
//         ...prev,
//         // activeRowId: null,
//         // activeCell: null,
//         expandedRows:{}
//       };
//     });
//   } catch (error) {
//     cb(
//       {
//         valid: false,
//         errors: new Map<string, CellError>([['system', { caption: '', rowId: NaN, message: error }]]),
//         data: null
//       }
//     );

//   }
// }
// isValidCell(
//   tableKey: string,
//   rowId: number,
//   caption: string
// ): ValidCell {
//   try {
//     const store = this.getStore(tableKey)?.getState();
//     if (!store) return { isValid: false, cellError: { caption: "", rowId: NaN, message: "حافظه پیدا نشد" } };

//     const table = store.table;
//     const rowIndex = table.getRows().sort((a, b) => {
//       const aIndex = Number(a.getCells().get("index")?.getValue()?.value ?? 0);
//       const bIndex = Number(b.getCells().get("index")?.getValue()?.value ?? 0);
//       return aIndex - bIndex;
//     }).findIndex(r => r.id.value == rowId)
//     const schema = table.getColumnSchema(new ColumnId(caption));
//     const cell = table.getRow(rowId).getCell(caption)
//     if (!schema) return { isValid: false, cellError: { caption: "", rowId: NaN, message: "اسکیما پیدا نشد" } }
//     const error = this.validateCell(cell.getValue().value as any, schema, caption,rowId);
//     if (error) {
//       return { isValid: false, cellError: error }
//     } else {
//       const cellId = `row-${rowIndex}-${caption}`;
//       this.errors.delete(cellId);
//       return { isValid: true, cellError: { caption: "", rowId: NaN, message: '' } }
//     }
//   } catch (e) {
//     return { isValid: false, cellError: { caption: "", rowId: NaN, message: e } }
//   }
// }