// application/TableAppService.ts

import {
  Actor,
  TableCommand,
} from './commands';
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
  ChangeTableTypeCommandHandler,
  ChangeUnitLevelHandler,
  DeleteTableCommandHandler,
  ResetTableCommandHandler,
} from './handlers/tableCommandHandler';

export class TableAppService {

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
    private readonly changeTableType: ChangeTableTypeCommandHandler,
    private readonly deleteTable: DeleteTableCommandHandler,
    private readonly resetTable: ResetTableCommandHandler,
    private readonly applyDynamicProjection: ApplyDynamicProjectionHandler,

  ) {}

  execute(command: TableCommand, actor: Actor) {
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
      case 'SET_TABLE_TYPE':
        return this.changeTableType.execute(command, actor);
      default:
        throw new Error(`Unhandled command: ${(command as any).type}`);
    }
  }
}
