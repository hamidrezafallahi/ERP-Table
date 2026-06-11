import React, { useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  CustomModal,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  ClipboardCheck,
  ClipboardIcon,
  CutIcon,
  GuaranteeReceive,
  Layers,
  PlusIcon,
  TrashBin,
} from '@components/atoms/iconComponents';

import { TableActions } from '../domain/value-objects';
import { UITableController } from '../infrastructure/ui/UITableController';
import MultiselectList from './multiSelectList';
import { IMultiSelectConfig } from './type';

interface GroupActionButtonsProps {
  controller: UITableController;
  multiSelectConfig?: IMultiSelectConfig;
}

export const GroupActionButtons: React.FC<GroupActionButtonsProps> = ({
  controller,
  multiSelectConfig,
}) => {
  const t = useTranslations();
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  const selectedRows = controller.getSelectedRows();
  const count = selectedRows ? Object.keys(selectedRows).length : 0;
  const table = controller.getViewState();
  const tableAction = table?.action;
  const handleAddRow = () => {
    void controller.dispatch({ type: "ADD_EMPTY_ROW" });
  };

  const handleSelectAllRows = () => {
    controller.dispatch({ type: "TOGGLE_ROW_SELECTED" });
  };
  const handleChangeTableAction = (action: TableActions) => {
    controller.dispatch({ type: "UI_ACTION_TABLE", action });
  };
  const handleDeleteSelectedRows = () => {
    controller.dispatch({ type: "UI_DELETE_SELECTED_ROW" });
  };
  return (
    <div className="flex flex-1 justify-start items-center gap-2">
      <CustomTooltip title={t("general.addNewRow")}>
        <button
          type="button"
          className="flex justify-center items-center p-1 border rounded"
          onClick={handleAddRow}
        >
          <PlusIcon config={{ width: 18, height: 18 }} />
        </button>
      </CustomTooltip>
      <CustomTooltip title={t("general.copy")}>
        <button
          type="button"
          disabled={count == 0}
          className={`flex justify-center items-center p-1 border rounded ${count == 0 && "opacity-40"}`}
          onClick={() => {
            handleChangeTableAction("copy");
          }}
        >
          <GuaranteeReceive config={{ width: 18, height: 18 }} />
        </button>
      </CustomTooltip>
      <CustomTooltip title={t("general.cut")}>
        <button
          type="button"
          disabled={count == 0}
          className={`flex justify-center items-center p-1 border rounded ${count == 0 && "opacity-40"}`}
          onClick={() => {
            handleChangeTableAction("cut");
          }}
        >
          <CutIcon config={{ width: 18, height: 18 }} />
        </button>
      </CustomTooltip>
      <CustomTooltip title={t("general.paste")}>
        <button
          type="button"
          disabled={
            !((tableAction == "copy" || tableAction == "cut") && count != 0)
          }
          className={`flex justify-center items-center p-1 border rounded ${!((tableAction == "copy" || tableAction == "cut") && count != 0) && "opacity-40"}`}
          onClick={() => {
            handleChangeTableAction("paste");
          }}
        >
          <ClipboardIcon config={{ width: 18, height: 18 }} />
        </button>
      </CustomTooltip>
      <CustomTooltip title={t("general.delete")}>
        <button
          type="button"
          disabled={count == 0}
          className={`flex justify-center items-center p-1 border rounded ${count == 0 && "opacity-40"}`}
          onClick={handleDeleteSelectedRows}
        >
          <TrashBin config={{ width: 18, height: 18 }} />
        </button>
      </CustomTooltip>
      {multiSelectConfig && (
        <>
          <CustomTooltip title={t("general.chooseFromList")}>
            <button
              onClick={() => {
                setModalIsOpen(true);
              }}
              className="flex justify-center items-center p-1 border rounded"
            >
              <ClipboardCheck config={{ width: 18, height: 18 }} />
            </button>
          </CustomTooltip>
          <CustomModal
            contentClassName={"w-[720px] !h-[480px]"}
            headerName={t("general.chooseFromList")}
            headerIcon={<ClipboardCheck config={{ width: 18, height: 18 }} />}
            closeModal={() => setModalIsOpen(false)}
            isModalOpen={modalIsOpen}
            content={
              <MultiselectList
                controller={controller}
                multiSelectConfig={multiSelectConfig}
                handleCloseModal={()=>{setModalIsOpen(false)}}
              />
            }
          />
        </>
      )}
      <CustomTooltip title={t("general.toggle")}>
        <button
          onClick={handleSelectAllRows}
          className="flex justify-center items-center p-1 border rounded"
        >
          <Layers config={{ width: 18, height: 18 }} />
        </button>
      </CustomTooltip>

      <span className="px-2 text-black-black6 text-xs">
        {t("general.selected")} {count}
      </span>
    </div>
  );
};
