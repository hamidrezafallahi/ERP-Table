import {
  Dispatch,
  JSX,
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';

import {
  CustomTooltip,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import { DynamicTree } from '@components/atoms/defaultElements/dynamicTree';
import {
  type IDetail,
  type IDetailColumnConfig,
  RowStateEnum,
} from '@services/generalType/type';
import type {
  IOption,
  IRequestConfig,
} from '@type/elementType';
import { getCookie } from '@utils/cookie';
import { findItemInNestedData } from '@utils/core';

import type { IActions } from '../type';

interface IProps<T> {
  defaultData: T;
  detailData: T[];
  index: number;
  editState: {
    key: number;
    field: string;
  };
  field: string;
  alternateKey: string;
  conditionalKey?: string;
  dynamicValue: IRequestConfig;
  handleEdit: (index: number, field: string) => void;
  dispatchDetailData: Dispatch<IActions<T>>;
  renderCondition: Record<string, boolean>[];
  calcIndependent?: boolean;
  independentValue?: boolean;
  calcIndependentValue?: (
    rowData: T,
    FieldName: string,
    value: any,
    option?: any,
  ) => Promise<Partial<T>>;
  width?: number;
}

export const RenderSelectField = <T extends IDetail>({
  defaultData,
  detailData,
  index,
  editState,
  field,
  alternateKey,
  conditionalKey,
  dynamicValue,
  dispatchDetailData,
  handleEdit,
  renderCondition,
  calcIndependent,
  independentValue,
  calcIndependentValue,
  width,
}: IProps<T>): JSX.Element => {
  const t = useTranslations();
  const globalCurrencyValue = getCookie("CurrencyId").split("/")[0];
  const globalCurrencyTitle = getCookie("CurrencyId").split("/")[1];
  const globalYearValue = getCookie("YearId").split("/")[0];
  const globalYearTitle = getCookie("YearId").split("/")[1];
  const globalPlaceValue = getCookie("PlaceId").split("/")[0];
  const globalPlaceTitle = getCookie("PlaceId").split("/")[1];
  const globalCashierValue = getCookie("CashierId").split("/")[0];
  const globalCashierTitle = getCookie("CashierId").split("/")[1];

  let defaultValue;
  let defaultLabel;

  if (field) {
    if (field.includes("CurrencyId")) {
      defaultValue = Number(globalCurrencyValue);
      defaultLabel = globalCurrencyTitle;
    }
    if (field.includes("CashierId")) {
      defaultValue = Number(globalCashierValue);
      defaultLabel = globalCashierTitle;
    }
    if (field.includes("YearId")) {
      defaultValue = Number(globalYearValue);
      defaultLabel = globalYearTitle;
    }
    if (field.includes("PlaceId")) {
      defaultValue = Number(globalPlaceValue);
      defaultLabel = globalPlaceTitle;
    }
  }
  const rowData = detailData[index];
  const relatedKey = field.replace(/Id$/, "");
  const relatedObject = rowData?.[field] && rowData?.[relatedKey];
  const stringTitle =
    relatedObject &&
    Object.values(relatedObject)?.find(
      (val) => typeof val === "string" && val.trim() !== "",
    );
  const defaultTitle = stringTitle
    ? stringTitle?.toString()
    : t("general.selectField");

  const [title, setTitle] = useState<string | null>(null);
  const [options, setOptions] = useState<IOption[]>([]);

  const condition = renderCondition?.find((item, idx) => idx === index);
  const isEditing = editState.key === index && editState.field === field;

  const handleGetOptions = (options: IOption[]) => {
    if (options.length > 0) setOptions(options);
  };
  const onSelectChange = async (
    newValue: unknown,
    option: any,
    field: string,
    index: number,
  ) => {
    const rowData = detailData[index];

    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(
          rowData,
          field,
          newValue,
          option,
        );
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }

    if (rowData?.RowState !== RowStateEnum.Delete) {
      const updatedRow = {
        index,
        data: {
          [field]: newValue,
          [relatedKey]: {
            [`${relatedKey}Desc`]: option?.label
              ? option?.label
              : option?.title,
          },
          ...independentParameter,
        },
      };

      const targetItem = renderCondition[index];
      if (targetItem) {
        const fieldKeys = Object?.keys(targetItem).filter(
          (key) => targetItem[key],
        );
        const currentFieldIndexLeft = fieldKeys.indexOf(editState.field);
        const newFocusedField = fieldKeys[currentFieldIndexLeft + 1];
        handleEdit(index, newFocusedField);
      }

      const currentValue = rowData ? rowData[field] : defaultValue;
      if (newValue !== currentValue) {
        dispatchDetailData({
          type: "UPDATE_ROW",
          payload: updatedRow as { index: number; data: Partial<T> },
        });
      }
    }
  };

  useEffect(() => {
    const selectedItem = rowData && rowData[field];

    if (selectedItem) {
      const selectedTitle = options.find((item) => item.value === selectedItem);

      setTitle(selectedTitle ? selectedTitle.label : null);
    } else {
      setTitle(null);
    }
  }, [detailData, field, options]);

  useEffect(() => {
    if (defaultValue && !rowData[field]) {
      const defaultOption = options.find(
        (item) => item.value === defaultValue,
      ) ?? { label: defaultLabel };
      onSelectChange(defaultValue, defaultOption, field, index);
    }
  }, []);

  if (condition && !condition[field]) {
    return (
      <div
        className={`${width ? "" : "!min-w-[140px] w-auto"}`}
        style={width ? { width: `${width}px` } : undefined}
      >
        -
      </div>
    );
  }

  if (isEditing && rowData?.RowState !== RowStateEnum.Delete) {
    return (
      <DynamicSelect
        showId
        infinite
        dynamicValue={{
          [alternateKey]: rowData[alternateKey],
          [conditionalKey]: rowData[conditionalKey],
          ...dynamicValue,
        }}
        id={field}
        className={`!bg-white !border-[0.4px] !border-gray-gray7 !h-fit ${
          width ? "" : "!min-w-[140px] w-auto"
        } `}
        style={width ? { width: `${width}px` } : undefined}
        showSearch
        allowClear
        popupMatchSelectWidth={400}
        onOptionsChange={handleGetOptions}
        value={rowData ? rowData[field] : defaultValue}
        onChange={(newValue, option) =>
          onSelectChange(newValue, option, field, index)
        }
        onSearchPhrase={(correctOptionValue, correctOptionTitle) =>
          onSelectChange(correctOptionValue, correctOptionTitle, field, index)
        }
        autoFocus={isEditing}
        // onDropdownVisibleChange={(open) => setIsOpen(open)}
        // onKeyDown={(e) => {
        //   if (isOpen) {
        //     e.stopPropagation();
        //   } else {
        //     e.preventDefault();
        //   }
        // }}
      />
    );
  }

  return (
    <CustomTooltip title={title ? title : defaultTitle}>
      <span
        id={field}
        className={`flex items-center ${
          width ? "" : "!min-w-[140px] w-auto"
        } h-[2.1rem] `}
        style={width ? { width: `${width}px` } : undefined}
        onClick={() => handleEdit(index, field)}
      >
        {title ? title : defaultTitle}
      </span>
    </CustomTooltip>
  );
};

export const RenderTreeField = <T extends IDetail>({
  defaultData,
  detailData,
  index,
  editState,
  field,
  alternateKey,
  conditionalKey,
  dynamicValue,
  dispatchDetailData,
  handleEdit,
  renderCondition,
  calcIndependent,
  independentValue,
  calcIndependentValue,
  width,
}: IProps<T>): JSX.Element => {
  const t = useTranslations();

  const rowData = detailData[index];
  const relatedKey = field.replace(/Id$/, "");
  const relatedObject = rowData?.[field] && rowData?.[relatedKey];
  const stringTitle =
    relatedObject &&
    Object.values(relatedObject)?.find(
      (val) => typeof val === "string" && val.trim() !== "",
    );
  const defaultTitle = stringTitle
    ? stringTitle?.toString()
    : t("general.selectField");
  const [title, setTitle] = useState<string | null>(null);
  const [options, setOptions] = useState<IOption[]>([]);

  const condition = renderCondition?.find((item, idx) => idx === index);
  const isEditing = editState.key === index && editState.field === field;

  const handleGetOptions = (options: IOption[]) => {
    if (options.length > 0) setOptions(options);
  };

  const onTreeChange = async (
    newValue,
    labelList: any,
    field: string,
    index: number,
  ) => {
    const rowData = detailData[index];
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(rowData, field, newValue);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }

    if (rowData?.RowState !== RowStateEnum.Delete) {
      const updatedRow = {
        index,
        data: {
          [field]: newValue,
          [relatedKey]: {
            [`${relatedKey}Desc`]: labelList[0],
          },
          ...independentParameter,
        },
      };

      const targetItem = renderCondition[index];

      if (targetItem) {
        const fieldKeys = Object?.keys(targetItem).filter(
          (key) => targetItem[key],
        );
        const currentFieldIndexLeft = fieldKeys.indexOf(editState.field);
        const newFocusedField = fieldKeys[currentFieldIndexLeft + 1];
        handleEdit(index, newFocusedField);
      }

      const currentValue = rowData ? rowData[field] : undefined;
      if (newValue !== currentValue) {
        dispatchDetailData({
          type: "UPDATE_ROW",
          payload: updatedRow as { index: number; data: Partial<T> },
        });
      }
    }
  };

  useEffect(() => {
    const selectedItem = rowData && rowData[field];
    if (selectedItem) {
      // const selectedTitle = options.find((item) => item.value === selectedItem);
      const selectedTitle = findItemInNestedData(
        options,
        "value",
        selectedItem,
      );
      setTitle(selectedTitle ? selectedTitle.title : null);
    } else {
      setTitle(null);
    }
  }, [detailData, field, options]);

  if (condition && !condition[field]) {
    return (
      <div
        className={`${width ? "" : "!min-w-[140px] w-auto"}`}
        style={width ? { width: `${width}px` } : undefined}
      >
        -
      </div>
    );
  }

  if (isEditing && rowData?.RowState !== RowStateEnum.Delete) {
    return (
      <DynamicTree
        showId
        dynamicValue={{
          ...dynamicValue,
          [alternateKey]: rowData[alternateKey],
          [conditionalKey]: rowData[conditionalKey],
        }}
        id={field}
        className={`!bg-white !border-[0.4px] !border-gray-gray7 ${
          width ? "" : "!min-w-[140px] w-auto"
        } !h-fit`}
        style={width ? { width: `${width}px` } : undefined}
        showSearch
        allowClear
        popupMatchSelectWidth={400}
        onOptionsChange={handleGetOptions}
        value={rowData ? rowData[field] : undefined}
        onChange={(newValue, labelList) =>
          onTreeChange(newValue, labelList, field, index)
        }
        onSearchPhrase={(correctOptionValue, correctOptionLabel) =>
          onTreeChange(correctOptionValue, [correctOptionLabel], field, index)
        }
        autoFocus={isEditing}
      />
    );
  }

  return (
    <CustomTooltip title={title ? title : defaultTitle}>
      <span
        id={field}
        className={`flex items-center ${
          width ? "" : "!min-w-[140px] w-auto"
        } h-[2.1rem]`}
        style={width ? { width: `${width}px` } : undefined}
        onClick={() => handleEdit(index, field)}
      >
        {title ? title : defaultTitle}
      </span>
    </CustomTooltip>
  );
};

export const RenderStaticValue = <T extends IDetail>({
  detailData,
  index,
  field,
  staticConfig,
  width,
}: {
  detailData: T[];
  index: number;
  field: string;
  staticConfig: IDetailColumnConfig["staticConfig"];
  width: number;
}) => {
  const t = useTranslations();
  const [correctValue, setCorrectValue] = useState(null);
  const { mode, config, valueType } = staticConfig;
  const rowData = detailData[index];

  useEffect(() => {
    if (mode === "function") {
      const correctFnModeVal = config(rowData);

      setCorrectValue(
        valueType === "price"
          ? correctFnModeVal?.toLocaleString("fa-IR")
          : correctFnModeVal,
      );
    }
  }, [detailData]);
  useEffect(() => {
    if (mode === "staticOption") {
      const value =
        typeof rowData[field] === "number" ? rowData[field] : undefined;
      const correctStaticOption = config?.find(
        (item) => item.value === value,
      )?.title;
      setCorrectValue(correctStaticOption);
    }
  }, []);

  return (
    <div
      id={field}
      className={`flex items-center rounded ${
        width ? "" : "!w-[120px]"
      }  h-[2.1rem] cursor-default ${staticConfig.className}`}
      style={width ? { width: `${width}px` } : undefined}
    >
      {correctValue ? correctValue : t("general.unknown")}
    </div>
  );
};
