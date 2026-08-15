import { useTranslations } from 'next-intl';

import { CustomDropdownButton } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import {
  Dots,
  DragIcon,
  Expand,
  RedTrashBin,
  Undo,
} from '@components/atoms/iconComponents';

import { ColumnSchema } from '../../bootstrap/type';
import { RowStateEnum } from '../../domain/value-objects';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { UIRow } from '../type';

interface IndexColProps {
  tableKey: string;
  idx: number;
  row: UIRow;
  controller: UITableController;
  meta: ColumnSchema;
}

export const IndexCol: React.FC<IndexColProps> = ({
  idx,
  tableKey,
  row,
  controller,
  meta,
}) => {
  const t = useTranslations();

  const handleDeleteRow = () => {
    controller.dispatch({ type: "ROW_DELETED", rowId: row.id });
  };

  const handleCopyRow = () => {
    controller.dispatch({ type: "DUPLICATE_ROW", rowId: row.id });
  };

  const handleAddRow = () => {
    void controller.dispatch({ type: "ADD_EMPTY_ROW" });
  };

  const items = [
    {
      key: "1",
      label: (
        <span className="flex text-sm" onClick={handleCopyRow}>
          {t("general.replicateRow")}
        </span>
      ),
      extra: "Ali + D",
    },
    {
      key: "2",
      label: (
        <span className="flex text-sm" onClick={handleAddRow}>
          {t("general.addNewRow")}
        </span>
      ),
      extra: "Alt + N",
    },
    {
      type: "divider",
    },
    ...(meta.indexOptions?.(tableKey, row.id, row, controller) || []),
  ];

  const handleExpandRow = () => {
    controller.dispatch({ type: "TOGGLE_ROW_EXPANDED", rowId: row.id });
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

        {meta.enableMoveButton && !isDeleted && (
          <div
            className="flex justify-center items-center w-[16px] h-[16px] cursor-grab active:cursor-grabbing"
            draggable={false}
            onMouseDown={(e) => {
              const tr = e.currentTarget.closest("tr");
              tr?.setAttribute("draggable", "true");
            }}
          >
            <DragIcon config={{ width: 16, height: 16 }} />
          </div>
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

        {meta.enableExpandButton && (
          <button
            type="button"
            onClick={handleExpandRow}
            className={`z-20  ${
              isDeleted ? "cursor-not-allowed " : "hover:bg-zinc-200"
            } `}
            disabled={isDeleted}
          >
            <Expand config={{ width: 18, height: 18 }} />
          </button>
        )}
      </div>

      {meta.enableOptionsButton && !isDeleted && (
        <CustomDropdownButton
          placement="bottom"
          className="flex m-0 p-0 rounded"
          items={items as any}
        >
          <a className="cursor-pointer" onClick={(e) => e.preventDefault()}>
            <Dots config={{ width: 18, height: 18 }} />
          </a>
        </CustomDropdownButton>
      )}
    </div>
  );
};
