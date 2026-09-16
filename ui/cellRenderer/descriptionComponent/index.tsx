"use client";
import React, {
  forwardRef,
  Ref,
  useMemo,
} from 'react';

import { ColumnSchema } from '../../../bootstrap/type';
import {
  UITableController,
} from '../../../infrastructure/ui/UITableController';
import { useLocale, useRemoteQuery } from '../../host';
import { highlightIfCurrentSearch } from '../../gridSearch/highlightText';
import {
  CustomDropdownButton,
  CustomTooltip,
  Dots,
  SavePlus,
} from '../../primitives';
import { UIRow } from '../../type';
import {
  VoucherTypeApiResponse,
} from './type';

export interface DescriptionComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  value?: unknown;
  onChange?: (e: unknown) => void;
  meta: ColumnSchema;
  controller: UITableController;
  tableKey: string;
  row: UIRow;
  columnId: string;
  idx: number;
  inputRef: Ref<HTMLInputElement | null>;
  isDeleted: boolean;
  editable: boolean;
  blockDrag: (e: React.DragEvent) => void;
  dispatchChangeValue: (newValue: unknown) => void;
  activeCell: () => void;
  searchQuery?: string;
  isCurrentSearchMatch?: boolean;
}
export interface IDesc {
  AccountDescItemId: number;
  AccountDescId: number;
  Desc: string;
}

export const DescriptionComponent = forwardRef<
  HTMLDivElement,
  DescriptionComponentProps
>((props, ref) => {
  const locale = useLocale();
  const {
    meta,
    controller,
    tableKey,
    row,
    columnId,
    idx,
    inputRef,
    isDeleted,
    editable,
    value,
    blockDrag,
    dispatchChangeValue,
    activeCell,
    searchQuery,
    isCurrentSearchMatch,
  } = props;
  const showSearchHit = !!(isCurrentSearchMatch && searchQuery?.trim());
  const { endpoint, dependOn } = meta.dynamicSource ?? {};

  const hasDependValue = (
    dependOn:
      | { fieldName: string; value: unknown }
      | Array<{ fieldName: string; value: unknown }>,
  ) => {
    if (Array.isArray(dependOn)) {
      return dependOn.every(
        (item) => item.value !== null && item.value !== undefined,
      );
    }
    return dependOn.value !== null && dependOn.value !== undefined;
  };
  const dependencyBody = Array.isArray(dependOn)
    ? Object.fromEntries(
        dependOn.map((item) => [item.fieldName, item.value]),
      )
    : dependOn
      ? { [dependOn.fieldName]: dependOn.value }
      : {};
  const { data: menuData } = useRemoteQuery<VoucherTypeApiResponse>({
    url: endpoint,
    body: {
      ...dependencyBody,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 10000,
      },
    },
    skip: dependOn ? !hasDependValue(dependOn) : false,
  });
  const items = useMemo(
    () =>
      menuData?.Data?.map((item, index) => ({
        key: String(index),
        label: item.Desc,
        onClick: () => {
          meta.onChange?.(tableKey, row.id, row, controller,item.Desc);
          controller?.dispatch({
            type: "UI_CELL_CHANGE",
            rowId: row.id,
            columnId,
            value: item.Desc,
          });
        },
      })) || [],
    [menuData?.Data],
  );
const handleSaveDescription = ()=>{
  controller?.dispatch({
            type: "UI_DESCRIPTION_SAVE",
            rowId: row.id,
            flag:true
          });
}
  return (
    <div className="flex justify-between items-center w-full">
      {showSearchHit ? (
        <span
          className={`px-2 w-full text-xs truncate ${
            isDeleted ? 'cursor-not-allowed' : ''
          } ${meta.className ?? ''}`}
          onClick={() => activeCell()}
        >
          {highlightIfCurrentSearch(value, searchQuery, true)}
        </span>
      ) : (
      <input
        key={idx}
        ref={inputRef}
        disabled={isDeleted || !editable}
        value={value == null ? "" : String(value)}
        className={`${isDeleted && "cursor-not-allowed"}
              pdg-cell-editor bg-transparent px-2
           ring-0 focus:!ring-0 focus:ring-offset-0  transition-colors !h-full w-full text-xs  ${meta.className}`}
        draggable={false}
        onDragStart={blockDrag}
        onDragOver={blockDrag}
        onDrop={blockDrag}
        onChange={(e) => dispatchChangeValue(e.target.value)}
        onClick={() => activeCell()}
      />
      )}

      <CustomDropdownButton
        placement={locale !== "fa" ? "bottomRight" : "bottomLeft"}
        className="flex justify-center items-center bg-gray-gray3 dark:!bg-gray-gray11 p-0 rounded !h-9 cursor-pointer"
        items={items}
        dropdownClassName="max-h-[20rem] max-w-[40vw]"
      >
        <span className="cursor-pointer" id="descriptionsList">
          <Dots />
        </span>
      </CustomDropdownButton>

      <CustomTooltip
      //   title={isDisabled ? t("general.notActive") : t("general.save")}
      //   className={`
      //              bg-gray-gray3 flex justify-center items-center w-[2.125rem] h-[2.125rem] rounded
      //               ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      //             `}
      >
        <button
          onClick={() => {
            //   if (!isDisabled) {
                handleSaveDescription();
            //   }
          }}
        >
          <SavePlus
            config={{
              width: 18,
              height: 18,
              stroke: "black",
            }}
          />
        </button>
      </CustomTooltip>
    </div>
  );
});

DescriptionComponent.displayName = "DescriptionComponent";
