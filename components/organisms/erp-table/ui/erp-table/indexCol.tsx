import {
  useEffect,
  useState,
} from 'react';

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

import { UITableController } from '../../adapters/ui/UITableController';
import { RowStateEnum } from '../../domain/value-objects';
import { TCell } from '../../engine/type';
import { CellMeta } from './cellRenderer';

interface IndexColProps {
  tableKey: string;
  row: {
    id: number;
    cells: Record<string, TCell>;
    rowState: RowStateEnum;
    isExpanded: boolean;
  };
  controller: UITableController;
  meta: CellMeta;
}

export const IndexCol: React.FC<IndexColProps> = ({
  tableKey,
  row,
  controller,
  meta,
}) => {
  const [, forceUpdate] = useState(0);
  const t = useTranslations();
  const index = row.cells["index"].value as number;
  const selectedRow = controller.getSelectedRows(tableKey);
  const isSelectedRow = controller.isSelectedRow(tableKey, row.id);
  const isExpandableRow = controller.isExpandableRow(tableKey, row.id);
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
    {
      key: "3",
      disabled: Object.keys(selectedRow).length === 0,
      label: (
        <span
          className="flex text-sm"
          onClick={() => {
            // setAllowCopy(true);
          }}
        >
          {t("general.copy")}
        </span>
      ),
      extra: "Ctrl + Enter",
    },
    {
      key: "4",
      disabled: Object.keys(selectedRow).length === 0,
      label: (
        <span
          className="flex text-sm"
          onClick={() => {
            // handleGroupPasteRow(index);
          }}
        >
          {t("general.paste")}
        </span>
      ),
      extra: "Ctrl + Enter",
    },
    {
      key: "5",
      disabled: Object.keys(selectedRow).length === 0,
      label: (
        <span
          className="flex text-sm"
          onClick={() => {
            // handleGroupPasteRowAsNew(index);
          }}
        >
          {t("general.pasteAsNew")}
        </span>
      ),
      // extra: "Ctrl + Enter",
    },
    {
      key: "6",
      disabled: Object.keys(selectedRow).length === 0,
      label: (
        <span
          className="flex text-sm"
          onClick={() => {
            // handleGroupDelete();
          }}
        >
          {t("general.selectedGroupDelete")}
        </span>
      ),
      // extra: "Ctrl + Enter",
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
    } else {
    }
  };

  const isDeleted = row.rowState === RowStateEnum.Deleted;
  useEffect(() => {
    if (!controller) return;
    const unsubscribe = controller.subscribeRow(row.id, () => {
      forceUpdate((t) => t + 1);
    });
    return () => unsubscribe?.();
  }, [controller, row.id]);
  return (
    <div
      className={` ${
        isDeleted && "cursor-not-allowed"
      }  flex justify-around items-center gap-2 px-2 w-36 relative`}
    >
      {!isDeleted && (
        <CustomCheckbox
          disabled={isDeleted}
          checked={isSelectedRow}
          onClick={handleSelectRow}
        />
      )}
      <div className="w-[18px] text-xs text-center">{index}</div>

      {!isDeleted && (
        <>
          <div
            className={`flex cursor-grab active:cursor-grabbing justify-center items-center w-[16px] h-[16px] `}
            draggable={false}
            onMouseDown={(e) => {
              const tr = e.currentTarget.closest("tr");
              tr?.setAttribute("draggable", "true");
            }}
          >
            <DragIcon config={{ width: 16, height: 16 }} />
          </div>

          {isExpandableRow && (
            <button
              type="button"
              onClick={handleExpandRow}
              className={`z-20  ${
                isDeleted ? "cursor-not-allowed " : "hover:bg-red-100"
              } `}
              disabled={isDeleted}
            >
              <Expand config={{ width: 18, height: 18 }} />
            </button>
          )}
        </>
      )}

      <button
        type="button"
        onClick={handleDeleteRow}
        className="hover:bg-red-100"
      >
        {!isDeleted ? (
          <RedTrashBin config={{ width: 18, height: 18 }} />
        ) : (
          <Undo config={{ width: 18, height: 18 }} />
        )}
      </button>

      {!isDeleted && (
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
