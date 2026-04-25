// application/TableAppService.ts

import {
  Actor,
  TableCommand,
} from './commands';
import {
  ApplyDynamicProjectionHandler,
  ChangeCellDisplayValueHandler,
  ChangeCellValueHandler,
} from './handlers/cellCommandsHandler';
import {
  AddNewRowCommandHandler,
  DeleteRowCommandHandler,
  DuplicateRowCommandHandler,
  ReorderRowCommandHandler,
} from './handlers/rowCommandsHandler';
import {
  ChangePageCommandHandler,
  ChangePageSizeCommandHandler,
  ChangeUnitLevelHandler,
  DeleteTableCommandHandler,
  ResetTableCommandHandler,
} from './handlers/tableCommandHandler';

export class TableAppService {

  constructor(
    private readonly changeCellValue: ChangeCellValueHandler,
    private readonly changeCellDisplayValue: ChangeCellDisplayValueHandler,
    private readonly addEmptyRow: AddNewRowCommandHandler,
    private readonly duplicateRow: DuplicateRowCommandHandler,
    private readonly deleteRow: DeleteRowCommandHandler,
    private readonly reorderRow: ReorderRowCommandHandler,
    private readonly setUnitLevel: ChangeUnitLevelHandler,
    private readonly setPageSize: ChangePageSizeCommandHandler,
    private readonly setPage: ChangePageCommandHandler,
    private readonly deleteTable: DeleteTableCommandHandler,
    private readonly resetTable: ResetTableCommandHandler,
    private readonly applyDynamicProjection: ApplyDynamicProjectionHandler,

  ) {}

  execute(command: TableCommand, actor: Actor) {
    switch (command.type) {
      case 'CHANGE_CELL_VALUE':
        return this.changeCellValue.execute(command, actor);
      case 'APPLY_DYNAMIC_PROJECTION':
        return this.applyDynamicProjection.execute(command, actor);
      case 'CHANGE_CELL_DISPLAY_VALUE':
        return this.changeCellDisplayValue.execute(command, actor);
      case 'ADD_EMPTY_ROW':
        return this.addEmptyRow.execute(command, actor);
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
      default:
        throw new Error(`Unhandled command: ${(command as any).type}`);
    }
  }
}
