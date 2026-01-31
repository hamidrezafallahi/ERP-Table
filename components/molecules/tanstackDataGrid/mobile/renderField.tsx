import { ChangeEvent, useEffect, useRef, useState } from "react";

import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useTranslations } from "next-intl";

import {
  CustomButton,
  CustomTooltip,
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import CustomCheckbox from "@components/atoms/defaultElements/checkbox";
import { DynamicTree } from "@components/atoms/defaultElements/dynamicTree";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import { ApplyIcon } from "@components/atoms/iconComponents";
import { useGetData } from "@services/base";
import type { IDetail, IDetailColumnConfig } from "@services/generalType/type";
import type { ISelectOption } from "@type/elementType";
import { getCookie } from "@utils/core";

import type { IEditRowFormProps, IRenderFieldProps } from "./type";

export const RenderSelectField = ({
  config,
  value,
}: {
  config: IDetailColumnConfig;
  value: number;
}) => {
  const { endpoint, repoViewId, ...bodyRequest } = config.dynamicValue;
  const body = {
    ...bodyRequest,
    RepoViewId: repoViewId,
    id: value,
  };

  const { data } = useGetData<ISelectOption[], null>({
    url: endpoint,
    body: body,
    skip: !config.dynamicValue || !value,
    id: endpoint,
  });

  const title = data?.Data?.[0]?._SelectDisplay;

  return (
    <span className="text-sm" key={config.fieldName} id={config.fieldName}>
      {title}
    </span>
  );
};

export const RenderStaticField = <T,>({
  record,
  field,
  staticConfig,
}: {
  record: T;
  field: string;
  staticConfig: IDetailColumnConfig["staticConfig"];
}) => {
  const t = useTranslations();
  const [correctValue, setCorrectValue] = useState(null);
  const { mode, config, valueType } = staticConfig;

  useEffect(() => {
    if (mode === "function") {
      const correctFnModeVal = config(record);
      setCorrectValue(
        valueType === "price"
          ? correctFnModeVal?.toLocaleString("fa-IR")
          : correctFnModeVal
      );
    }
  }, [record]);
  useEffect(() => {
    if (mode === "staticOption") {
      const value =
        typeof record[field] === "number" ? record[field] : undefined;
      const correctStaticOption = config?.find(
        (item) => item.value === value
      )?.title;
      setCorrectValue(correctStaticOption);
    }
  }, []);

  return (
    <div
      id={field}
      className="flex items-center rounded !w-[120px] h-[2.1rem] cursor-default"
    >
      {correctValue ? correctValue : t("general.unknown")}
    </div>
  );
};

export const EditRowForm = <T extends IDetail>({
  recordIndex,
  dispatchDetailData,
  detailData,
  configs,
  alternateKey,
  handleSave,
  conditionRenderer,
  calcIndependentValue,
}: IEditRowFormProps<T>) => {
  const t = useTranslations();

  const data = detailData[recordIndex];

  const onSelectChange = async (
    newValue: unknown,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean,
    option?: unknown
  ) => {
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(
          data,
          field,
          newValue,
          option
        );
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }
    const updatedRow = {
      index,
      data: {
        [field]: newValue,
        ...independentParameter,
      },
    };

    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow as { index: number; data: Partial<T> },
    });
  };
  const onTextChange = async (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => {
    const value = e.target.value;
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(data, field, value);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }

    const updatedRow = {
      index,
      data: {
        [field]: value,
        ...independentParameter,
      },
    };

    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow as { index: number; data: Partial<T> },
    });
  };
  const onDateChange = async (
    value: string,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => {
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(data, field, value);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }
    const updatedRow = {
      index,
      data: {
        [field]: value,
        ...independentParameter,
      },
    };

    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow as { index: number; data: Partial<T> },
    });
  };
  const onNumberChange = async (
    value,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => {
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(data, field, value);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }
    const updatedRow = {
      index,
      data: {
        [field]: +value,
        ...independentParameter,
      },
    };

    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow as { index: number; data: Partial<T> },
    });
  };
  const onPriceChange = async (
    value,
    field: string,
    isChangeField: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => {
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(data, field, value);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }
    const updatedRow = {
      index,
      data: {
        [field]: +value,
        [isChangeField]: true,
        ...independentParameter,
      },
    };

    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow as { index: number; data: Partial<T> },
    });
  };
  const onApply = (index: number, field: string, value: boolean) => {
    const updatedRow = {
      index,
      data: {
        [field]: !value,
      },
    };

    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow as { index: number; data: Partial<T> },
    });
  };
  const onTreeChange = async (
    newValue,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => {
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(data, field, newValue);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }
    const updatedRow = {
      index,
      data: {
        [field]: newValue,
        ...independentParameter,
      },
    };

    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow as { index: number; data: Partial<T> },
    });
  };
  const onBooleanChange = async (
    e: CheckboxChangeEvent,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => {
    const value = e.target.checked;
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(
          data,
          field,
          value ? true : false
        );
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }

    const updatedRow = {
      index,
      data: {
        [field]: value ? true : false,
        ...independentParameter,
      },
    };

    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow as { index: number; data: Partial<T> },
    });
  };

  const initialRenderCondition = configs
    ?.sort((a, b) => a.order - b.order)
    ?.reduce((acc, item) => {
      acc[item.fieldName] = item.conditionKey ? false : true;
      return acc;
    }, {} as Record<string, boolean>);

  return (
    <div className="relative w-full h-[calc(100dvh-135px)]">
      <div className="flex flex-col gap-2 px-2 w-full h-full overflow-y-auto">
        {configs?.map((config) => {
          if (config.conditionKey) {
            const conditionValue = data?.[config.conditionKey];

            const condition = conditionRenderer(
              conditionValue,
              config?.fieldName,
              initialRenderCondition
            );
            if (condition?.[config?.fieldName]) {
              return (
                <div key={config.fieldName} className="flex flex-col gap-2">
                  {config.fieldType !== "boolean" && (
                    <span className="font-medium">{config.fieldCaption}</span>
                  )}

                  <FormFieldRenderer
                    config={config}
                    recordIndex={recordIndex}
                    record={data}
                    alternateKey={alternateKey}
                    onTreeChange={onTreeChange}
                    onSelectChange={onSelectChange}
                    onTextChange={onTextChange}
                    onNumberChange={onNumberChange}
                    onPriceChange={onPriceChange}
                    onApply={onApply}
                    onDateChange={onDateChange}
                    onBooleanChange={onBooleanChange}
                  />
                </div>
              );
            }
          } else {
            return (
              <div key={config.fieldName} className="flex flex-col gap-2">
                {config.fieldType !== "boolean" && (
                  <span className="font-medium">{config.fieldCaption}</span>
                )}

                <FormFieldRenderer
                  config={config}
                  recordIndex={recordIndex}
                  record={data}
                  alternateKey={alternateKey}
                  onBooleanChange={onBooleanChange}
                  onDateChange={onDateChange}
                  onNumberChange={onNumberChange}
                  onPriceChange={onPriceChange}
                  onApply={onApply}
                  onSelectChange={onSelectChange}
                  onTextChange={onTextChange}
                  onTreeChange={onTreeChange}
                />
              </div>
            );
          }
        })}
      </div>

      <div className="right-0 bottom-0 left-0 z-20 fixed flex flex-col bg-white p-4 w-full text-xs topShadow">
        <CustomButton
          type="text"
          className={`text-sm flex justify-center items-center focus:!text-none focus:none focus-within:none active:none active:bg-black-black95 !bg-black-black95 rounded w-full h-[42px] text-white`}
          onClick={handleSave}
        >
          {t("general.save")}
        </CustomButton>
      </div>
    </div>
  );
};

const FormFieldRenderer = <T,>({
  config,
  record,
  recordIndex,
  alternateKey,
  onTreeChange,
  onSelectChange,
  onTextChange,
  onNumberChange,
  onPriceChange,
  onDateChange,
  onBooleanChange,
  onApply,
}: IRenderFieldProps<T>) => {
  const {
    fieldName,
    isChangeField,
    isApplyField,
    applyTooltip,
    fieldCaption,
    fieldType,
    dynamicValue,
    conditionKey,
    staticConfig,
    calcIndependent,
    independentValue,
  } = config;

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const globalCurrencyValue = getCookie("CurrencyId").split("/")[0];
  const globalYearValue = getCookie("YearId").split("/")[0];
  const globalPlaceValue = getCookie("PlaceId").split("/")[0];
  const globalCashierValue = getCookie("CashierId").split("/")[0];

  let defaultValue;

  if (fieldName) {
    if (fieldName.includes("CurrencyId")) {
      defaultValue = Number(globalCurrencyValue);
    }
    if (fieldName.includes("CashierId")) {
      defaultValue = Number(globalCashierValue);
    }
    if (fieldName.includes("YearId")) {
      defaultValue = Number(globalYearValue);
    }
    if (fieldName.includes("PlaceId")) {
      defaultValue = Number(globalPlaceValue);
    }
  }

  if (!record?.[fieldName] && defaultValue) {
    onSelectChange(
      defaultValue,
      fieldName,
      recordIndex,
      independentValue,
      calcIndependent
    );
  }

  switch (fieldType) {
    case "treeOption":
      return (
        <DynamicTree
          key={fieldName}
          id={fieldName}
          dynamicValue={{
            ...dynamicValue,
            [alternateKey]: record?.[alternateKey],
            [conditionKey]: record?.[conditionKey],
          }}
          value={record?.[fieldName]}
          showSearch
          allowClear
          showId
          onChange={(val) => {
            if (val !== record?.[fieldName]) {
              onTreeChange(
                val,
                fieldName,
                recordIndex,
                independentValue,
                calcIndependent
              );
            }
          }}
          onSearchPhrase={(val) => {
            if (val !== record?.[fieldName]) {
              onTreeChange(
                val,
                fieldName,
                recordIndex,
                independentValue,
                calcIndependent
              );
            }
          }}
        />
      );
    case "selectOption":
      return (
        <DynamicSelect
          key={fieldName}
          id={fieldName}
          dynamicValue={{
            ...dynamicValue,
            [alternateKey]: record?.[alternateKey],
            [conditionKey]: record?.[conditionKey],
          }}
          value={record?.[fieldName]}
          showSearch
          allowClear
          infinite
          showId
          onChange={(val, option) => {
            if (val !== record?.[fieldName]) {
              onSelectChange(
                val,
                fieldName,
                recordIndex,
                independentValue,
                calcIndependent,
                option
              );
            }
          }}
          onSearchPhrase={(val, option) => {
            if (val !== record?.[fieldName]) {
              onSelectChange(
                val,
                fieldName,
                recordIndex,
                independentValue,
                calcIndependent,
                option
              );
            }
          }}
        />
      );
    case "text":
      return (
        <InputText
          key={fieldName}
          id={fieldName}
          value={record?.[fieldName] ?? ""}
          onChange={(e) => {
            const key = `${recordIndex}-${fieldName}`;

            if (debounceTimers.current[key]) {
              clearTimeout(debounceTimers.current[key]);
            }

            debounceTimers.current[key] = setTimeout(() => {
              onTextChange(
                e,
                fieldName,
                recordIndex,
                independentValue,
                calcIndependent
              );
            }, 500);
          }}
          // onChange={(e) =>
          //   onTextChange(
          //     e,
          //     fieldName,
          //     recordIndex,
          //     independentValue,
          //     calcIndependent
          //   )
          // }
        />
      );
    case "number":
      return (
        <CustomInputNumber
          key={fieldName}
          id={fieldName}
          controls={false}
          prefix=""
          min={0}
          keyboard={false}
          value={record?.[fieldName] ?? 0}
          onChange={(value) => {
            const key = `${recordIndex}-${fieldName}`;

            if (debounceTimers.current[key]) {
              clearTimeout(debounceTimers.current[key]);
            }

            debounceTimers.current[key] = setTimeout(() => {
              onNumberChange(
                value,
                fieldName,
                recordIndex,
                independentValue,
                calcIndependent
              );
            }, 500);
          }}
          // onChange={(val) =>
          //   onNumberChange(
          //     val,
          //     fieldName,
          //     recordIndex,
          //     independentValue,
          //     calcIndependent
          //   )
          // }
        />
      );
    case "price":
      return (
        <CustomInputNumber
          key={fieldName}
          id={fieldName}
          controls={false}
          prefix=""
          min={0}
          keyboard={false}
          parser={(val) => val?.replace(/\$\s?|(,*)/g, "") as unknown as number}
          formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          value={record?.[fieldName] ?? 0}
          onChange={(value) => {
            const key = `${recordIndex}-${fieldName}`;

            if (debounceTimers.current[key]) {
              clearTimeout(debounceTimers.current[key]);
            }

            debounceTimers.current[key] = setTimeout(() => {
              onNumberChange(
                value,
                fieldName,
                recordIndex,
                independentValue,
                calcIndependent
              );
            }, 500);
          }}
          // onChange={(val) =>
          //   onNumberChange(
          //     val,
          //     fieldName,
          //     recordIndex,
          //     independentValue,
          //     calcIndependent
          //   )
          // }
        />
      );
    case "changeablePrice":
      return (
        <div className="flex items-center gap-2">
          <CustomTooltip title={applyTooltip}>
            <div
              onClick={() =>
                onApply(recordIndex, isApplyField, record?.[isApplyField])
              }
            >
              <ApplyIcon
                config={{ apply: record?.[isApplyField] ? true : false }}
              />
            </div>
          </CustomTooltip>
          <CustomInputNumber
            key={fieldName}
            id={fieldName}
            controls={false}
            prefix=""
            min={0}
            keyboard={false}
            parser={(val) =>
              val?.replace(/\$\s?|(,*)/g, "") as unknown as number
            }
            formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            value={record?.[fieldName] ?? 0}
            onChange={(value) => {
              const key = `${recordIndex}-${fieldName}`;

              if (debounceTimers.current[key]) {
                clearTimeout(debounceTimers.current[key]);
              }

              debounceTimers.current[key] = setTimeout(() => {
                onPriceChange(
                  value,
                  fieldName,
                  isChangeField,
                  recordIndex,
                  independentValue,
                  calcIndependent
                );
              }, 500);
            }}
            // onChange={(val) =>
            //   onNumberChange(
            //     val,
            //     fieldName,
            //     recordIndex,
            //     independentValue,
            //     calcIndependent
            //   )
            // }
          />
        </div>
      );
    case "unChangeablePrice":
      return (
        <div id={fieldName} className={`flex items-center rounded  h-[2.1rem]`}>
          <span className="ps-2">
            {record
              ? record?.[fieldName]
                ? record?.[fieldName]?.toLocaleString("fa-IR")
                : 0
              : ""}
          </span>
        </div>
      );
    case "date":
      return (
        <NewDatePicker
          key={fieldName}
          onChange={(date) =>
            onDateChange(
              date as string,
              fieldName,
              recordIndex,
              independentValue,
              calcIndependent
            )
          }
        />
      );
    case "boolean":
      return (
        <CustomCheckbox
          key={fieldName}
          id={fieldName}
          checked={record?.[fieldName]}
          onChange={(e) =>
            onBooleanChange(
              e,
              fieldName,
              recordIndex,
              independentValue,
              calcIndependent
            )
          }
        >
          {fieldCaption}
        </CustomCheckbox>
      );

    case "static":
      return (
        <RenderStaticField
          record={record}
          field={fieldName}
          staticConfig={staticConfig}
        />
      );

    default:
      return null;
  }
};
