
import { FC, useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { useGetData } from "@services/base";
import type { IBaseRequest } from "@services/base/type";
import type {
  IOption,
  ISelectOption,
  ITreeSelectOption,
} from "@type/elementType";

import { CustomTreeSelect } from "../treeSelect";
import type { IProps } from "./type";

export const DynamicTree: FC<IProps> = ({
  value,
  showId = false,
  onChange,
  dynamicValue,
  onSearchPhrase,
  config,
  onOptionsChange,
  showIdInDesc = true,
  ...props
}) => {
  const t = useTranslations();

  const [options, setOptions] = useState([]);

  const { endpoint, repoViewId, addButton, dependOn, ...bodyRequest } =
    dynamicValue;
  const body: IBaseRequest<any> = {
    ...bodyRequest,
    ...(dependOn ? { [dependOn.fieldName]: dependOn.value } : {}),
    RepoViewId: repoViewId,
  };

  const transformDataToTree = (data: ITreeSelectOption[]) => {
    return data?.map((item) => {
      return showId
        ? {
            key: item._SelectId,
            // title: showIdInDesc
            //   ? `${item._SelectId} - ${item._SelectDisplay}`
            //   : `${item._SelectDisplay}`,
            title: `${item._SelectDisplay}`,
            value: item._SelectId,

            children:
              item._SelectId && item._SubItems.length > 0
                ? transformDataToTree(item._SubItems)
                : undefined,
          }
        : {
            key: item._SelectId,
            title: `${item._SelectDisplay}`,
            value: item._SelectId,

            children:
              item._SelectId && item._SubItems?.length > 0
                ? transformDataToTree(item._SubItems)
                : undefined,
          };
    });
  };

  const existBody = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => value !== null),
  );

  const { data, refetch, isFetching } = useGetData<ISelectOption[], null>({
    url: endpoint,
    body: existBody,
    skip: dependOn ? !dependOn.value : false,
  });

  const handleRefetch = () => {
    refetch();
  };

  useEffect(() => {
    if (data?.Data) {
      const staticOptions = transformDataToTree(data?.Data);
      setOptions(staticOptions);
    }
  }, [data?.Data]);

  useEffect(() => {
    if (onOptionsChange && options) {
      onOptionsChange(options);
    }
  }, [options, onOptionsChange]);

  const findOptionWithTitle = (data: IOption[], searchTerm: string) => {
    const results = [];
    const search = (items) => {
      items.forEach((item) => {
        if (
          item?.title?.includes(searchTerm) ||
          item?.label?.includes(searchTerm)
        ) {
          results.push(item);
        }
        if (item.children && item.children.length > 0) {
          search(item.children);
        }
      });
    };
    search(data);
    return results;
  };

  return (
    <CustomTreeSelect
      {...props}
      isFetching={isFetching}
      handleRefetch={handleRefetch}
      config={
        config
          ? {
              name: config.name,
              caption: config.caption,
              help: config.help,
              order: config.order,
              placeHolder: config.placeHolder,
              rules: config.rules,
              type: config.type,
              selectEndpoint: config.selectEndpoint,
              value: config.value,
              setFieldValue: config.setFieldValue,
            }
          : null
      }
      showSearch
      treeNodeFilterProp="title"
      popupMatchSelectWidth={400}
      value={value}
      styles={{
        popup: {
          root: {
            maxHeight: 400,
            overflow: "auto",
            scrollPaddingBlock: 10,
          },
        },
      }}
      placeholder={t("general.search")}
      allowClear
      treeData={options}
      onChange={onChange}
      onSearch={(value) => {
        const correctOption = findOptionWithTitle(options, value);
        if (correctOption.length === 1) {
          if (onSearchPhrase) {
            return onSearchPhrase(
              correctOption[0].value,
              correctOption[0]?.title,
            );
          }
        }
      }}
      addButton={addButton}
    />
  );
};
