import React, { useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  CustomModal,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  ClipboardCheck,
  PlusIcon,
  TrashBin,
} from '@components/atoms/iconComponents';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { GridSearchControl } from '../gridSearch/GridSearchControl';
import MultiselectList from '../multiSelectList';
import { IMultiSelectConfig } from '../type';

interface MobileActionButtonsProps {
  controller: UITableController;
  multiSelectConfig?: IMultiSelectConfig;
}

export function MobileActionButtons({
  controller,
  multiSelectConfig,
}: MobileActionButtonsProps) {
  const t = useTranslations();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const selectedRows = controller.getSelectedRows();
  const count = selectedRows ? Object.keys(selectedRows).length : 0;
  const handleAddRow = () => {
    void controller.dispatch({ type: 'UI_OPEN_MOBILE_ADD' });
  };

  const handleDeleteSelectedRows = () => {
    controller.dispatch({ type: "UI_DELETE_SELECTED_ROW" });
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <CustomTooltip title={t("general.addNewRow")}>
        <button
          type="button"
          className="flex justify-center items-center p-1 border rounded"
          onClick={handleAddRow}
        >
          <PlusIcon config={{ width: 18, height: 18 }} />
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
              onClick={() => setModalIsOpen(true)}
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
                handleCloseModal={() => setModalIsOpen(false)}
              />
            }
          />
        </>
      )}

      <GridSearchControl controller={controller} />

      <span className="px-2 text-black-black6 text-xs">
        {t("general.selected")} {count}
      </span>
    </div>
  );
}
