import React, { useState } from 'react';

import { useDirection, useHostToast, useTranslations } from '../host';
import {
  ClipboardCheck,
  ClipboardIcon,
  CustomModal,
  CustomTooltip,
  CutIcon,
  Excel,
  GuaranteeReceive,
  Layers,
  PlusIcon,
  Spin,
  SpinIcon,
  TrashBin,
} from '../primitives';

import { TableActions } from '../../domain/value-objects';
import { exportActiveCollectionToExcel } from '../../infrastructure/excel/exportActiveCollectionToExcel';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { GridSearchControl } from '../gridSearch/GridSearchControl';
import MultiselectList from '../multiSelectList';
import { IMultiSelectConfig } from '../type';

interface GroupActionButtonsProps {
  controller: UITableController;
  multiSelectConfig?: IMultiSelectConfig;
}

export const GroupActionButtons: React.FC<GroupActionButtonsProps> = ({
  controller,
  multiSelectConfig,
}) => {
  const t = useTranslations();
  const direction = useDirection();
  const { success, error } = useHostToast();
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState(false);

  const selectedRows = controller.getSelectedRows();
  const count = selectedRows ? Object.keys(selectedRows).length : 0;
  const table = controller.getViewState();
  const tableAction = table?.action;

  const handleAddRow = () => {
    void controller.dispatch({ type: "ADD_EMPTY_ROW" });
  };

  const handleExportToExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportActiveCollectionToExcel(controller, {
        direction,
        rowHeaderLabel: t('general.row'),
      });
      success(t("general.exportToExcelSuccess"));
    } catch {
      error(t("general.exportToExcelError"));
    } finally {
      setIsExporting(false);
    }
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
    <div className="flex items-center gap-2 flex-1 justify-start">
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
                      contentClassName={"!h-[480px]"}
                      width={ 720}
            headerName={t("general.chooseFromList")}
            headerIcon={<ClipboardCheck config={{ width: 18, height: 18 }} />}
            closeModal={() => setModalIsOpen(false)}
            isModalOpen={modalIsOpen}
            content={
              <MultiselectList
                controller={controller}
                multiSelectConfig={multiSelectConfig}
                handleCloseModal={() => { setModalIsOpen(false); }}
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

      <CustomTooltip title={t("general.exportToExcel")}>
        <button
          type="button"
          disabled={isExporting}
          className={`flex justify-center items-center p-1 border rounded ${isExporting ? "opacity-60 cursor-wait" : ""}`}
          onClick={() => {
            void handleExportToExcel();
          }}
        >
          {isExporting ? (
            <Spin
              size="small"
              indicator={<SpinIcon config={{ width: 16, height: 16 }} />}
            />
          ) : (
            <Excel config={{ width: 18, height: 18 }} />
          )}
        </button>
      </CustomTooltip>

      <GridSearchControl controller={controller} />

      <span className="px-2 text-black-black6 text-xs">
        {t("general.selected")} {count.toLocaleString(direction === 'rtl' ? 'fa-IR' : 'en-US')}
      </span>
    </div>
  );
};
