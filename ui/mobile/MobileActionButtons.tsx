import React, { useState } from 'react';

import { useTranslations } from '../host';
import {
  CustomModal,
  ClipboardCheck,
  PlusIcon,
  TrashBin,
} from '../primitives';

import { UITableController } from '../../infrastructure/ui/UITableController';
import type { PluginHost } from '../../application/plugins/PluginHost';
import { ToolbarIconButton } from '../a11y/ToolbarIconButton';
import { PdfExportToolbarButton } from '../export/PdfExportToolbarButton';
import { ExcelImportToolbarButton } from '../export/ExcelImportToolbarButton';
import { GridSearchControl } from '../gridSearch/GridSearchControl';
import MultiselectList from '../multiSelectList';
import { ThemeToggleButton } from '../theme/ThemeToggleButton';
import { IMultiSelectConfig } from '../type';

interface MobileActionButtonsProps {
  controller: UITableController;
  multiSelectConfig?: IMultiSelectConfig;
  pluginHost?: PluginHost;
}

export function MobileActionButtons({
  controller,
  multiSelectConfig,
  pluginHost,
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
    <div
      className="flex items-center gap-2 justify-end"
      role="toolbar"
      aria-label={t("general.toolbar")}
    >
      <ToolbarIconButton label={t("general.addNewRow")} onClick={handleAddRow}>
        <PlusIcon config={{ width: 18, height: 18 }} />
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
            onClick={() => setModalIsOpen(true)}
          >
            <ClipboardCheck config={{ width: 18, height: 18 }} />
          </ToolbarIconButton>
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

      <ExcelImportToolbarButton pluginHost={pluginHost} />

      <PdfExportToolbarButton pluginHost={pluginHost} />

      <GridSearchControl controller={controller} />

      <ThemeToggleButton />

      <span className="px-2 text-black-black6 text-xs">
        {t("general.selected")} {count}
      </span>
    </div>
  );
}
