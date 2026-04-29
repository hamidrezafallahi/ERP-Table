import React from 'react';

import { useTranslations } from 'next-intl';

import { UITableController } from '../adapters/ui/UITableController';

interface AddNewRowButtonProps {
  controller: UITableController;
}

export const AddNewRowButton: React.FC<AddNewRowButtonProps> = ({
  controller,
}) => {
  const t = useTranslations();
  const handleAddRow = () => {
    void controller.dispatch({ type: "ADD_EMPTY_ROW" });
  };
  const selectedRow = controller.getSelectedRows();
  const AllRows = controller.getAllRows();
  const count = selectedRow?  Object.keys(selectedRow).length:0;
  const table = controller.getViewState();
  const isSelectedAllRows = AllRows.every(
    (row) => !!table.selectedRows[row.id],
  );
   const handleSelectAllRows = () => {
    controller.dispatch({ type: "TOGGLE_ROW_SELECTED" });
  };
  return (
    <div className="flex items-between items-center gap-2 w-60">
      <button type="button" className="w-fit" onClick={handleAddRow}>
        +
      </button>

      <span className="px-2 text-gray-gray10 text-xs w">
        {t("general.selected")} {count}
      </span>

      <button
        className="px-2 text-black-black6 text-xs"
        onClick={handleSelectAllRows}
      >
        {!isSelectedAllRows ? t("general.selectAll") : t("general.deSelectAll")}
      </button>
    </div>
  );
};
