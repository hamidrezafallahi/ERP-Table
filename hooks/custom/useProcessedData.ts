import { useMemo } from "react";

import { TableProps } from "antd";

import { IColumnConfig } from "@services/generalType/type";
import { convertDate, renderBadge } from "@utils/core";

interface IProps {
  data: any;
  columnsConfig: IColumnConfig[];
  locale: string;
  timezone?: string;
  includeTime?: boolean;
}

export const useProcessedData = ({
  data,
  columnsConfig,
  locale,
  timezone,
  includeTime = false,
}: IProps) => {
  function flattenObject(obj, parentKey = "", result = {}) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          flattenObject(obj[key], newKey, result);
        } else {
          result[newKey] = obj[key];
        }
      }
    }
    return result;
  }

  let newData = [];

  data?.map((item) => {
    const nes = flattenObject(item);
    newData.push(nes);
  });

  const processedData: TableProps<any>["dataSource"] = useMemo(() => {
    return newData?.map((item) => {
      const newItem = { ...item };

      columnsConfig &&
        columnsConfig.forEach((field) => {
          if (field?.fieldType === "date" && item[field?.fieldName]) {
            newItem[field?.fieldName] = convertDate({
              dateString: item[field?.fieldName],
              locale: locale,
              includeTime: includeTime,
              timezone: timezone,
            });
          }
          if (field?.fieldType === "price" && item[field?.fieldName]) {
            newItem[field?.fieldName] =
              locale === "fa"
                ? item[field?.fieldName].toLocaleString("fa-IR")
                : item[field?.fieldName].toLocaleString("en-US");
          }

          if (
            field?.fieldType === "function" &&
            typeof field?.renderFunction === "function"
          ) {
            newItem[field.fieldName] = field.renderFunction(item);
          }

          if (field?.fieldType === "conditional") {
            const correctValue = field?.conditionalConfig?.find(
              (el) => el.value === item[field.fieldName]
            );

            if (correctValue) {
              if (correctValue?.badgeType) {
                newItem[field?.fieldName] = renderBadge({
                  type: correctValue?.badgeType,
                  title: correctValue?.title
                    ? correctValue?.title
                    : item[field?.fieldName],
                });
              } else {
                newItem[field?.fieldName] = correctValue?.title;
              }
            }
          }
        });

      return newItem;
    });
  }, [newData, columnsConfig]);

  return processedData;
};
