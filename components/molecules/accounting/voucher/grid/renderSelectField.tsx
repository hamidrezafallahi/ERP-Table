import { Dispatch, FC, useEffect, useState } from "react";

import {
  CustomTooltip,
  DynamicSelect,
} from "@components/atoms/defaultElements";
import type { IVoucherDetails } from "@services/acc/voucherDetails/type";
import type { IOption, IRequestConfig } from "@type/elementType";

import type { IActions, IVoucherDetailCondition } from "./type";

interface IProps {
  realDetailData: IVoucherDetails[];
  index: number;
  renderCondition: IVoucherDetailCondition[];
  level: number;
  editState: {
    key: number;
    field: keyof IVoucherDetailCondition;
  };
  field: keyof IVoucherDetailCondition;
  dynamicValue: IRequestConfig;
  handleEdit: (index: number, field: keyof IVoucherDetailCondition) => void;
  dispatchDetailData: Dispatch<IActions>;
}

export const RenderSelectField: FC<IProps> = ({
  realDetailData,
  index,
  renderCondition,
  level,
  editState,
  field,
  dynamicValue,
  dispatchDetailData,
  handleEdit,
}) => {
  const [title, setTitle] = useState(null);
  const [defaultTitle, setDefaultTitle] = useState(null);
  const [options, setOptions] = useState([]);

  const rowData = realDetailData[index];
  const defaultData = rowData?.Levels?.find((item) => item.Level === level);

  const condition = renderCondition?.find((item, idx) => idx === index);

  const isEditing = editState.key === index && editState.field === field;

  const handleGetOptions = (options: IOption[]) => {
    options.length > 0 && setOptions(options);
  };

  const onSelectChange = (
    newValue,
    field: keyof IVoucherDetailCondition,
    index: number
  ) => {
    const updatedRow = {
      index,
      data: {
        [field]: newValue,
      },
    };

    if (newValue) {
      const targetItem = renderCondition[index];
      if (targetItem) {
        const fieldKeys = Object?.keys(targetItem).filter(
          (key) => targetItem[key]
        );
        const currentFieldIndexLeft = fieldKeys.indexOf(editState.field);
        const newFocusedField = fieldKeys[
          currentFieldIndexLeft + 1
        ] as keyof IVoucherDetailCondition;
        handleEdit(index, newFocusedField);
      }
    }
    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow,
    });
  };

  useEffect(() => {
    const selectedItem = realDetailData[index] && realDetailData[index][field];
    if (selectedItem) {
      const selectedTitle = options.find((item) => item.value === selectedItem);
      selectedTitle ? setTitle(selectedTitle.label) : setTitle(null);
    } else {
      setDefaultTitle(null);
      setTitle(null);
    }
    if (title === null && selectedItem !== undefined) {
      defaultData && defaultData?.desc && setDefaultTitle(defaultData.desc);
    } else {
      setDefaultTitle(null);
    }
  }, [realDetailData]);

  if (condition && !condition[field]) {
    return <div className="!w-[170px]">-</div>;
  }
  if (isEditing) {
    return (
      <DynamicSelect
        showId
        infinite
        dynamicValue={{
          ...dynamicValue,
          AccountId: rowData.AccountId,
        }}
        id={field}
        className="!bg-white !border-[0.4px] !border-gray-gray7 !w-[170px] !h-fit"
        showSearch
        allowClear
        popupMatchSelectWidth={400}
        onOptionsChange={(options) => handleGetOptions(options)}
        value={rowData ? rowData[field] : undefined}
        onChange={(newValue) => onSelectChange(newValue, field, index)}
        onSearchPhrase={(correctOption) =>
          onSelectChange(correctOption, field, index)
        }
        autoFocus={isEditing}
      />
    );
  }
  return (
    <CustomTooltip title={title ? title : defaultTitle}>
      <span
        id={field}
        className="flex items-center !w-[170px] h-[2.1rem]"
        onClick={() => handleEdit(index, field)}
      >
        {title ? title : defaultTitle}
      </span>
    </CustomTooltip>
  );
};
