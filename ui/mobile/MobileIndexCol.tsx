import { useTranslations } from 'next-intl';

import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import {
  EditPencil,
  RedTrashBin,
  Undo,
} from '@components/atoms/iconComponents';

import { ColumnSchema } from '../../bootstrap/type';
import { RowStateEnum } from '../../domain/value-objects';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { UIRow } from '../type';

interface MobileIndexColProps {
  idx: number;
  row: UIRow;
  controller: UITableController;
  meta: ColumnSchema;
}

export function MobileIndexCol({
  idx,
  row,
  controller,
  meta,
}: MobileIndexColProps) {
  const t = useTranslations();

  const handleDeleteRow = () => {
    controller.dispatch({ type: "ROW_DELETED", rowId: row.id });
  };

  const handleSelectRow = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      controller.onRowSelect(row.id);
    }
  };

  const isDeleted = row.rowState === RowStateEnum.Deleted;
  const isSelectedRow = controller.isSelectedRow(row.id);

  return (
    <div
      className={`${isDeleted && "cursor-not-allowed"} flex justify-between items-center w-full gap-2 px-2 h-full relative`}
    >
      <div className="flex justify-start items-center gap-2">
        {!isDeleted && (
          <CustomCheckbox
            disabled={isDeleted}
            checked={isSelectedRow}
            onClick={handleSelectRow}
          />
        )}
        <div className="w-[20px] text-xs text-center">{idx + 1}</div>

        {!isDeleted && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void controller.dispatch({
                type: 'UI_OPEN_MOBILE_EDIT',
                rowId: row.id,
              });
            }}
            className="hover:bg-zinc-200"
            aria-label={t("general.edit")}
          >
            <EditPencil config={{ width: 16, height: 16 }} />
          </button>
        )}

        {meta.enableDeleteButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRow();
            }}
            className="hover:bg-red-100"
          >
            {!isDeleted ? (
              <RedTrashBin config={{ width: 18, height: 18 }} />
            ) : (
              <Undo config={{ width: 18, height: 18 }} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
