import React, { useState } from 'react';

import { useDirection, useHostToast, useTranslations } from '../host';
import {
  ClipboardCheck,
  ClipboardIcon,
  CustomModal,
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
import type { PluginHost } from '../../application/plugins/PluginHost';
import { ToolbarIconButton } from '../a11y/ToolbarIconButton';
import { PdfExportToolbarButton } from '../export/PdfExportToolbarButton';
import { ExcelImportToolbarButton } from '../export/ExcelImportToolbarButton';
import { GridSearchControl } from '../gridSearch/GridSearchControl';
import MultiselectList from '../multiSelectList';
import { ThemeToggleButton } from '../theme/ThemeToggleButton';
import { IMultiSelectConfig } from '../type';

interface GroupActionButtonsProps {
  controller: UITableController;
  multiSelectConfig?: IMultiSelectConfig;
  pluginHost?: PluginHost;
}

export const GroupActionButtons: React.FC<GroupActionButtonsProps> = ({
  controller,
  multiSelectConfig,
  pluginHost,
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

  // Toolbar "toggle" = select/deselect all rows (engine TOGGLE_SELECT_ALL_ROWS).
  const handleSelectAllRows = () => {
    controller.dispatch({ type: "TOGGLE_ROW_SELECTED" });
  };

  const handleChangeTableAction = (action: TableActions) => {
    controller.dispatch({ type: "UI_ACTION_TABLE", action });
  };

  const handleDeleteSelectedRows = () => {
    controller.dispatch({ type: "UI_DELETE_SELECTED_ROW" });
  };

  const canPaste =
    (tableAction == "copy" || tableAction == "cut") && count != 0;

  return (
    <div
      className="flex items-center gap-2 flex-1 justify-start"
      role="toolbar"
      aria-label={t("general.toolbar")}
    >
      <ToolbarIconButton label={t("general.addNewRow")} onClick={handleAddRow}>
        <PlusIcon config={{ width: 18, height: 18 }} />
      </ToolbarIconButton>

      <ToolbarIconButton
        label={t("general.copy")}
        disabled={count == 0}
        onClick={() => {
          handleChangeTableAction("copy");
        }}
      >
        <GuaranteeReceive config={{ width: 18, height: 18 }} />
      </ToolbarIconButton>

      <ToolbarIconButton
        label={t("general.cut")}
        disabled={count == 0}
        onClick={() => {
          handleChangeTableAction("cut");
        }}
      >
        <CutIcon config={{ width: 18, height: 18 }} />
      </ToolbarIconButton>

      <ToolbarIconButton
        label={t("general.paste")}
        disabled={!canPaste}
        onClick={() => {
          handleChangeTableAction("paste");
        }}
      >
        <ClipboardIcon config={{ width: 18, height: 18 }} />
      </ToolbarIconButton>

      <ToolbarIconButton
        label={t("general.delete")}
        disabled={count == 0}
        onClick={handleDeleteSelectedRows}
      >
        <TrashBin config={{ width: 18, height: 18 }} />
      </ToolbarIconButton>

      {multiSelectConfig && (
        <>
          <ToolbarIconButton
            label={t("general.chooseFromList")}
            data-erp-multiselect=""
            onClick={() => {
              setModalIsOpen(true);
            }}
          >
            <ClipboardCheck config={{ width: 18, height: 18 }} />
          </ToolbarIconButton>
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

      <ToolbarIconButton
        label={t("general.toggle")}
        onClick={handleSelectAllRows}
      >
        <Layers config={{ width: 18, height: 18 }} />
      </ToolbarIconButton>

      <ToolbarIconButton
        label={t("general.exportToExcel")}
        disabled={isExporting}
        className={isExporting ? "opacity-60 cursor-wait" : ""}
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
      </ToolbarIconButton>

      <ExcelImportToolbarButton pluginHost={pluginHost} />

      <PdfExportToolbarButton pluginHost={pluginHost} />

      <GridSearchControl controller={controller} />

      <ThemeToggleButton />

      <span className="px-2 text-black-black6 text-xs">
        {t("general.selected")} {count.toLocaleString(direction === 'rtl' ? 'fa-IR' : 'en-US')}
      </span>
    </div>
  );
};
