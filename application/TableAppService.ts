// application/TableAppService.ts

import {
  Actor,
  ApplicationTableCommand,
} from './commands';
import { TableEvent } from './events';
import {
  ApplyDynamicProjectionHandler,
  ChangeCellDisplayValueHandler,
  ChangeCellValueHandler,
  SaveDescriptionHandler,
} from './handlers/cellCommandsHandler';
import {
  AddNewRowCommandHandler,
  AddNewRowsCommandHandler,
  DeleteRowCommandHandler,
  DuplicateRowCommandHandler,
  ReorderRowCommandHandler,
} from './handlers/rowCommandsHandler';
import {
  ChangePageCommandHandler,
  ChangePageSizeCommandHandler,
  SetActiveCollectionCommandHandler,
  ChangeUnitLevelHandler,
  DeleteTableCommandHandler,
  ResetTableCommandHandler,
} from './handlers/tableCommandHandler';
import type { EventStore } from './ports/EventStore';
import type { GridEvent } from '../domain/types/GridEvent';

export class TableAppService {
  private eventStore?: EventStore;

  constructor(
    private readonly changeCellValue: ChangeCellValueHandler,
    private readonly changeCellDisplayValue: ChangeCellDisplayValueHandler,
    private readonly saveDescription: SaveDescriptionHandler,
    private readonly addEmptyRow: AddNewRowCommandHandler,
    private readonly addNewRows: AddNewRowsCommandHandler,
    private readonly duplicateRow: DuplicateRowCommandHandler,
    private readonly deleteRow: DeleteRowCommandHandler,
    private readonly reorderRow: ReorderRowCommandHandler,
    private readonly setUnitLevel: ChangeUnitLevelHandler,
    private readonly setPageSize: ChangePageSizeCommandHandler,
    private readonly setPage: ChangePageCommandHandler,
    private readonly setActiveCollection: SetActiveCollectionCommandHandler,
    private readonly deleteTable: DeleteTableCommandHandler,
    private readonly resetTable: ResetTableCommandHandler,
    private readonly applyDynamicProjection: ApplyDynamicProjectionHandler,
  ) {}

  setEventStore(eventStore: EventStore): void {
    this.eventStore = eventStore;
  }

  async execute(command: ApplicationTableCommand, actor: Actor) {
    const result = await this.dispatch(command, actor);
    if (this.eventStore && result) {
      this.appendToEventStore(command, result).catch(() => {});
    }
    return result;
  }

  private dispatch(command: ApplicationTableCommand, actor: Actor) {
    switch (command.type) {
      case 'CHANGE_CELL_VALUE':
        return this.changeCellValue.execute(command, actor);
      case 'SAVE_DESCRIPTION':
        return this.saveDescription.execute(command, actor);
      case 'APPLY_DYNAMIC_PROJECTION':
        return this.applyDynamicProjection.execute(command, actor);
      case 'CHANGE_CELL_DISPLAY_VALUE':
        return this.changeCellDisplayValue.execute(command, actor);
      case 'ADD_EMPTY_ROW':
        return this.addEmptyRow.execute(command, actor);
      case 'ADD_NEW_ROWS':
        return this.addNewRows.execute(command, actor);
      case 'DUPLICATE_ROW':
        return this.duplicateRow.execute(command, actor);
      case 'ROW_DELETED':
        return this.deleteRow.execute(command, actor);
      case 'TABLE_RESET':
        return this.resetTable.execute(command, actor);
      case 'TABLE_DELETED':
        return this.deleteTable.execute(command, actor);
      case 'ROW_REORDERED':
        return this.reorderRow.execute(command, actor);
      case 'SET_UNIT_LEVEL':
        return this.setUnitLevel.execute(command, actor);
      case 'CHANGE_PAGE_SIZE':
        return this.setPageSize.execute(command, actor);
      case 'CHANGE_PAGE':
        return this.setPage.execute(command, actor);
      case 'SET_ACTIVE_COLLECTION':
        return this.setActiveCollection.execute(command, actor);
      default:
        throw new Error(`Unhandled command: ${(command as any).type}`);
    }
  }

  private async appendToEventStore(
    command: ApplicationTableCommand,
    result: TableEvent[] | TableEvent | null | unknown,
  ): Promise<void> {
    if (!this.eventStore) return;

    const events = this.normalizeResult(result);
    if (events.length === 0) return;

    const tableId = (command as any).tableKey ?? '';
    const streamId = `table:${tableId}`;

    const gridEvents: GridEvent[] = events.map((evt) => ({
      eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: evt.type,
      tableId: evt.tableId ?? tableId,
      streamId,
      version: 0,
      occurredAt: Date.now(),
      actorId: 'system',
      payload: evt,
    }));

    await this.eventStore.append(streamId, gridEvents, -1);
  }

  private normalizeResult(result: unknown): TableEvent[] {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (typeof result === 'object' && 'type' in (result as any)) {
      return [result as TableEvent];
    }
    return [];
  }
}
