import {
  useEffect,
  useState,
} from 'react';

import { Dropdown } from 'antd';
import { ItemType } from 'antd/es/menu/interface';

import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import {
  DragIcon,
  Expand,
  MoreVertical,
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
  const rowId = row.cells["index"].value as number;
    const isActiveRow = controller.isActiveRow(tableKey, row.id);
  const selectedRow = controller.isSelectedRow(tableKey,row.id)
  const handleDeleteRow = () => {
    controller.dispatch({ type: "ROW_DELETED", rowId });
  };

  const handleCopyRow = () => {
    controller.dispatch({ type: "DUPLICATE_ROW", rowId });
  };

  const items = [
    ...((meta.indexOptions?.(tableKey, rowId, row, controller) as ItemType[]) ||
      []),
  ].concat([
    {
      key: "copy",
      label: (
        <button type="button" onClick={handleCopyRow}>
          کپی سطر
        </button>
      ),
    },
    {
      key: "delete",
      icon: <RedTrashBin config={{ width: 18, height: 18 }} />,
      label: (
        <button type="button" onClick={handleDeleteRow}>
          حذف سطر
        </button>
      ),
    },
  ]);
  const handleExpandRow = () => {
    controller.dispatch({ type: "TOGGLE_ROW_EXPANDED", rowId });
  };
  const isDeleted = row.rowState === RowStateEnum.Deleted;
  useEffect(() => {
    if (!controller) return;
    const unsubscribe = controller.subscribeRow(rowId, () => {
      forceUpdate(t => t + 1);
    });
    return () => unsubscribe?.();
  }, [controller, rowId]);
  return (
    <div
      className={` ${
        isDeleted && "cursor-not-allowed"
      }  flex justify-around items-center gap-2 px-2 w-36`}
    >
      <CustomCheckbox disabled={isDeleted} checked={selectedRow}/>
      <div className="w-[18px] text-xs text-center">{rowId}</div>

      {!isDeleted ? (
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
      ) : (
        isDeleted && (
          <button
            className={`flex ${
              isDeleted && "cursor-not-allowed "
            }   justify-center items-center w-[16px] h-[16px] `}
            disabled={isDeleted}
          >
            <DragIcon config={{ width: 16, height: 16 }} />
          </button>
        )
      )}
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

      {!isDeleted ? (
        <button
          type="button"
          onClick={handleDeleteRow}
          className="hover:bg-red-100"
        >
          <RedTrashBin config={{ width: 18, height: 18 }} />
        </button>
      ) : isDeleted ? (
        <button
          type="button"
          disabled={isDeleted}
          className={` ${isDeleted && "cursor-not-allowed "}`}
        >
          <RedTrashBin config={{ width: 18, height: 18, stroke: "#939393" }} />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleDeleteRow}
          className="z-20 hover:bg-red-100"
        >
          <Undo config={{ width: 18, height: 18 }} />
        </button>
      )}

      <Dropdown placement="bottomRight" menu={{ items }} disabled={isDeleted}>
        <a onClick={(e) => e.preventDefault()}>
          <MoreVertical config={{ width: 18, height: 18 }} />
        </a>
      </Dropdown>
    </div>
  );
};
