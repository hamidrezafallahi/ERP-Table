import { Dispatch, FC, useEffect, useState } from "react";

import {
  CustomTooltip,
  DynamicSelect,
} from "@components/atoms/defaultElements";
import type { IOption, IRequestConfig } from "@type/elementType";

import type { IActions, IDetailCondition, IState } from "./type";

interface IProps {
  defaultData: IState;
  realDetailData: IState[];
  index: number;
  renderCondition: IDetailCondition[];
  editState: {
    key: number;
    field: keyof IDetailCondition;
  };
  field: keyof IDetailCondition;
  dynamicValue: IRequestConfig;
  handleEdit: (index: number, field: keyof IDetailCondition) => void;
  dispatchDetailData: Dispatch<IActions>;
}

// function getValueByField(field: string, rowData: IState) {
//   const fieldToValueMap = {
//     TafsiliId: rowData?.Tafsili?.TafsiliDesc,
//     FifthId: rowData?.Fifth?.TafsiliDesc,
//     SixthId: rowData?.Sixth?.TafsiliDesc,
//     SeventhId: rowData?.Seventh?.TafsiliDesc,
//     EightId: rowData?.Eight?.TafsiliDesc,
//     NineId: rowData?.Nine?.TafsiliDesc,
//     TenId: rowData?.Ten?.TafsiliDesc,
//     ElevenId: rowData?.Eleven?.TafsiliDesc,
//     TwelveId: rowData?.Twelve?.TafsiliDesc,
//     ThirteenId: rowData?.Thirteen?.TafsiliDesc,
//     BankAccountId: rowData?.BankAccount?.AccountName,
//     CashierId: rowData?.Cashier?.FullName,
//     TankhahdarId: rowData?.TankhahDar?.FullName,
//   };

//   return fieldToValueMap[field] || null;
// }

export const RenderSelectField: FC<IProps> = ({
  defaultData,
  realDetailData,
  index,
  renderCondition,
  editState,
  field,
  dynamicValue,
  dispatchDetailData,
  handleEdit,
}) => {
  const [title, setTitle] = useState(null);
  // const [defaultTitle, setDefaultTitle] = useState(null);
  const [renderCorrect, setRenderCorrect] = useState(true);
  const [options, setOptions] = useState([]);

  const rowData = realDetailData[index];
  // const defaultData = getValueByField(field, rowData);
  const defaultValue = defaultData ? defaultData[field] : null;
  const condition = renderCondition?.find((item, idx) => idx === index);

  const isEditing = editState.key === index && editState.field === field;

  const handleGetOptions = (options: IOption[]) => {
    options.length > 0 && setOptions(options);
  };

  const onSelectChange = (
    newValue,
    field: keyof IDetailCondition,
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
        ] as keyof IDetailCondition;
        handleEdit(index, newFocusedField);
      }
    }
    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow,
    });
  };

  useEffect(() => {
    if (defaultValue && renderCorrect && title) {
      setRenderCorrect(false);
    }
  }, [defaultValue, title]);

  useEffect(() => {
    const selectedItem = realDetailData[index] && realDetailData[index][field];
    if (selectedItem) {
      const selectedTitle = options.find((item) => item.value === selectedItem);
      selectedTitle ? setTitle(selectedTitle.label) : setTitle(null);
    } else {
      // setDefaultTitle(null);
      setTitle(null);
    }
    // if (title === null && selectedItem !== undefined) {
    //   defaultData && setDefaultTitle(defaultData);
    // } else {
    //   setDefaultTitle(null);
    // }
  }, [realDetailData, field, options]);

  if (condition && !condition[field]) {
    return <div className="!w-[170px]">-</div>;
  }

  if (defaultValue && renderCorrect) {
    return (
      <DynamicSelect
        showId
        infinite
        dynamicValue={{
          ...dynamicValue,
          AccountId: rowData?.RpWay?.AccountId,
        }}
        id={field}
        className="!bg-white !border-[0.4px] !border-gray-gray7 !w-[170px] !h-fit"
        showSearch
        allowClear
        popupMatchSelectWidth={400}
        onOptionsChange={handleGetOptions}
        value={rowData ? rowData[field] : undefined}
        onChange={(newValue) => onSelectChange(newValue, field, index)}
        onSearchPhrase={(correctOption) =>
          onSelectChange(correctOption, field, index)
        }
        autoFocus={isEditing}
      />
    );
  }

  if (isEditing) {
    return (
      <DynamicSelect
        showId
        infinite
        dynamicValue={{
          ...dynamicValue,
          AccountId: rowData?.RpWay?.AccountId,
        }}
        id={field}
        className="!bg-white !border-[0.4px] !border-gray-gray7 !w-[170px] !h-fit"
        showSearch
        allowClear
        popupMatchSelectWidth={400}
        onOptionsChange={handleGetOptions}
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
    <CustomTooltip title={title}>
      <span
        id={field}
        className="flex items-center !w-[170px] h-[2.1rem]"
        onClick={() => handleEdit(index, field)}
      >
        {title}
      </span>
    </CustomTooltip>
  );
};
