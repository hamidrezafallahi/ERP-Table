"use client";

import React, { useEffect, useMemo, useState } from "react";

import { useTranslations } from "../host";
import { CustomButton, CustomModal } from "../primitives";

import { ColumnSchema } from "../../bootstrap/type";
import { RowStateEnum } from "../../domain/value-objects";
import { UITableController } from "../../infrastructure/ui/UITableController";
import { CellRenderer } from "../cellRenderer";
import { resolveColumnMetaForRow } from "./buildDynamicSource";
import type { MobileRowEditorState } from "./types";
import { UIRow } from "../type";

interface MobileRowFormModalProps {
  controller: UITableController;
  tableKey: string;
  editor: NonNullable<MobileRowEditorState>;
  onClose: () => void;
}

export function MobileRowFormModal({
  controller,
  tableKey,
  editor,
  onClose,
}: MobileRowFormModalProps) {
  const t = useTranslations();

  const getRowById = (): UIRow | null => {
    return controller.getRowView(editor.rowId);
  };

  const [row, setRow] = useState<UIRow | null>(getRowById);

  useEffect(() => {
    const syncRow = () => {
      setRow(getRowById());
    };

    syncRow();
    const unsubscribe = controller.subscribe(syncRow);
    return () => unsubscribe?.();
  }, [controller, editor.rowId]);

  const formColumns = useMemo(() => {
    const table = controller.getViewState();
    if (!table?.columns) return [];
    return table.columns.filter(
      (c) =>
        !c.hidden && c.fieldType !== "index" && c.fieldName !== "index",
    );
  }, [controller, row]);

  if (!row || row.rowState === RowStateEnum.Deleted) {
    return null;
  }

  const title =
    editor.mode === "add" ? t("general.addNewRow") : t("general.rowEdit");

  return (
    <CustomModal
      headerName={title}
      isModalOpen
      closeModal={onClose}
      content={
        <div className="relative w-full h-[calc(100dvh-150px)]">
          <div className="flex flex-col gap-4 px-2 pb-24 w-full h-full overflow-y-auto">
            {formColumns.map((col, idx) => {
              const disable =
                typeof row.visibilityCondition[col.fieldName] === "boolean" &&
                row.visibilityCondition[col.fieldName] === false;

              if (disable) return null;

              const meta: ColumnSchema = resolveColumnMetaForRow(
                {
                  ...col,
                  enableDeleteButton: col.enableDeleteButton ?? true,
                  enableExpandButton: col.enableExpandButton ?? true,
                  enableMoveButton: col.enableMoveButton ?? true,
                  enableOptionsButton: col.enableOptionsButton ?? true,
                },
                row,
              );

              return (
                <div key={col.fieldName} className="flex flex-col gap-2">
                  {col.fieldType !== "checkbox" && (
                    <span className="font-medium text-sm">
                      {col.fieldCaption}
                    </span>
                  )}
                  <CellRenderer
                    key={`${row.id}-${col.fieldName}`}
                    idx={idx}
                    tableKey={tableKey}
                    row={row}
                    columnId={col.fieldName}
                    meta={meta}
                    controller={controller}
                    tabIndex={-1}
                    mode={col.editable === false ? "view" : "form"}
                  />
                </div>
              );
            })}
          </div>

          <div className="bottom-0 fixed px-4 py-4 -end-4 start-0 topShadow">
            <CustomButton
              type="text"
              className="flex justify-center items-center !bg-black-black95 focus:!text-none rounded w-full h-[42px] text-white text-sm"
              onClick={onClose}
            >
              {t("general.add")}
            </CustomButton>
          </div>
        </div>
      }
    />
  );
}
