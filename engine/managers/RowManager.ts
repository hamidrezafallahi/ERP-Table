// engine/managers/RowManager.ts

import {
  CellValue,
  ColumnId,
  TableActions,
} from '../../domain/value-objects';
import { EngineErrorHandler } from '../EngineErrorHandler';
import { TableStore } from '../tableStore';
import { TableState } from '../type';

export class RowManager {
    constructor(
        private readonly readStore: () => TableStore<TableState> | undefined,
        private readonly err: EngineErrorHandler,
    ) { }

    private getStore(tableKey: string) {
        const store = this.readStore();
        if (!store) {
            this.err.notFound('TableStore', tableKey, 'RowManager');
        }
        return store;
    }

    setRowExpanded(cmd: {
        tableKey: string;
        rowId: number;
        value: boolean;
    }): void {
        const { rowId, tableKey, value } = cmd;
        const store = this.getStore(tableKey);
        if (!store) return;

        const state = store.getState();
        const key = String(rowId);
        if (!!state.expandedRows[rowId] === value) return;

        store.setState(() => ({
            ...state,
            expandedRows: { ...state.expandedRows, [key]: value },
        }));
    }

    toggleRowExpanded(cmd: { tableKey: string; rowId: number }): void {
        const { rowId, tableKey } = cmd;
        const key = String(rowId);
        const store = this.getStore(tableKey);
        if (!store) return;

        const state = store.getState();
        const next = !state.expandedRows[key];
        store.setState(() => ({
            ...state,
            expandedRows: { ...state.expandedRows, [key]: next },
        }));
    }

    collapseAll(tableKey: string): void {
        const store = this.getStore(tableKey);
        if (!store) return;

        const state = store.getState();
        if (!state.expandedRows || Object.keys(state.expandedRows).length === 0)
            return;

        store.setState(() => ({ ...state, expandedRows: {} }));
    }

    moveVerticalSelectedRows(cmd: {
        tableKey: string;
        direction: 'down' | 'up';
    }): void {
        const store = this.getStore(cmd.tableKey);
        if (!store) return;

        store.setState(prev => {
            const table = prev.table;
            const selectedMap = prev.selectedRows;
            const allRows = table.getRows();

            const sortedRows = [...allRows].sort(
                (a, b) =>
                    (a.getCell('index')?.getValue() as number) -
                    (b.getCell('index')?.getValue() as number),
            );

            const selectedRows = sortedRows.filter(r => selectedMap[r.id.value]);
            if (selectedRows.length === 0) return prev;

            if (cmd.direction === 'up') {
                for (const row of selectedRows) {
                    const idx = sortedRows.findIndex(r => r.id.value === row.id.value);
                    if (idx === 0) continue;

                    const upperRow = sortedRows[idx - 1];
                    const rowIndex = row.getCell('index')?.getValue() as number;
                    const upperIndex = upperRow.getCell('index')?.getValue() as number;

                    row.changeCell(new ColumnId('index'), new CellValue(upperIndex));
                    upperRow.changeCell(new ColumnId('index'), new CellValue(rowIndex));

                    sortedRows[idx - 1] = row;
                    sortedRows[idx] = upperRow;
                }
            }

            if (cmd.direction === 'down') {
                for (let i = selectedRows.length - 1; i >= 0; i--) {
                    const row = selectedRows[i];
                    const idx = sortedRows.findIndex(r => r.id.value === row.id.value);
                    if (idx === sortedRows.length - 1) continue;

                    const lowerRow = sortedRows[idx + 1];
                    const rowIndex = row.getCell('index')?.getValue() as number;
                    const lowerIndex = lowerRow.getCell('index')?.getValue() as number;

                    row.changeCell(new ColumnId('index'), new CellValue(lowerIndex));
                    lowerRow.changeCell(new ColumnId('index'), new CellValue(rowIndex));

                    sortedRows[idx] = lowerRow;
                    sortedRows[idx + 1] = row;
                }
            }

            return { ...prev, table };
        });
    }

    moveVerticalActiveRow(cmd: {
        tableKey: string;
        direction: 'down' | 'up';
    }): void {
        const store = this.getStore(cmd.tableKey);
        if (!store) return;

        try {
            store.setState(prev => {
                const table = prev.table;
                const allRows = table.getRows();
                const activeRow = allRows.find(r => r.id.value == prev.activeRowId);
                if (!activeRow) return prev;

                const sortedRows = [...allRows].sort(
                    (a, b) =>
                        (a.getCell('index')?.getValue() as number) -
                        (b.getCell('index')?.getValue() as number),
                );

                if (cmd.direction === 'up') {
                    const idx = sortedRows.findIndex(
                        r => r.id.value === prev.activeRowId,
                    );
                    if (idx !== 0) {
                        const upperRow = sortedRows[idx - 1];
                        const rowIndex = activeRow.getCell('index')?.getValue() as number;
                        const upperIndex = upperRow.getCell('index')?.getValue() as number;

                        activeRow.changeCell(
                            new ColumnId('index'),
                            new CellValue(upperIndex),
                        );
                        upperRow.changeCell(
                            new ColumnId('index'),
                            new CellValue(rowIndex),
                        );
                        sortedRows[idx - 1] = activeRow;
                        sortedRows[idx] = upperRow;
                    }
                }

                if (cmd.direction === 'down') {
                    const idx = sortedRows.findIndex(
                        r => r.id.value === prev.activeRowId,
                    );
                    if (idx !== sortedRows.length - 1) {
                        const lowerRow = sortedRows[idx + 1];
                        const rowIndex = activeRow.getCell('index')?.getValue() as number;
                        const lowerIndex = lowerRow.getCell('index')?.getValue() as number;

                        activeRow.changeCell(
                            new ColumnId('index'),
                            new CellValue(lowerIndex),
                        );
                        lowerRow.changeCell(
                            new ColumnId('index'),
                            new CellValue(rowIndex),
                        );
                        sortedRows[idx] = lowerRow;
                        sortedRows[idx + 1] = activeRow;
                    }
                }

                return { ...prev, table };
            });
        } catch (error) {
            this.err.handle(error, 'RowManager.moveVerticalActiveRow');
        }
    }

    setTableAction(
        cmd: { tableKey: string; action: TableActions },
        _activeRowId: number | undefined,
    ): void {
        const store = this.getStore(cmd.tableKey);
        if (!store) return;

        const { table } = store.getState();

        switch (cmd.action) {
            case 'copy':
            case 'cut':
            case null:
                table.setTableAction(cmd.action);
                break;

            case 'paste':
            case 'pasteInsert':
                // Paste is handled by TableEngine.executePasteAction → AppService.
                break;

            default:
                break;
        }

        store.setState(prev => ({ ...prev, table }));
    }
}
