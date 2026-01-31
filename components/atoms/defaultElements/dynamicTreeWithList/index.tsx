import { FC, useEffect, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { TrashBin } from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import { useGetData } from "@services/base";
import type { IBaseRequest } from "@services/base/type";
import { setPageData } from "@slice/pages";
import type {
  IOption,
  ISelectOption,
  ITreeSelectOption,
} from "@type/elementType";
import { findItemInNestedData } from "@utils/core";

import { CustomTreeSelect } from "../treeSelect";
import type { IProps } from "./type";

interface IData {
  key: number;
  value: number;
  title: string;
  children: IData[];
  disabled?: boolean;
  listHeight?: number;
}

export const DynamicTreeWithList: FC<IProps> = ({
  showId = false,
  onChange,
  dynamicValue,
  onSearchPhrase,
  config,
  onOptionsChange,
  defOption,
  listHeight = "h-28",
  ...props
}) => {
  const t = useTranslations();
  const name = config?.name;
  const dispatch = useDispatch();
  const { selectedItems } = useAppSelector(
    (state) => ({
      selectedItems: state.withPersist.pages
        .find((item) => item.isActive)
        ?.pageData?.find((item) => item.name == config.name)?.value,
    }),
    shallowEqual
  );
  const [availableOptions, setAvailableOptions] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<IData[]>([]);

  const { endpoint, repoViewId, addButton, dependOn, ...bodyRequest } =
    dynamicValue;
  const body: IBaseRequest<any> = {
    ...bodyRequest,
    ...(dependOn ? { [dependOn.fieldName]: dependOn.value } : {}),
    RepoViewId: repoViewId,
  };

  const existBody = Object.fromEntries(
    Object.entries(body).filter(([_, value]) => value !== null)
  );

  const { data, refetch, isFetching } = useGetData<ISelectOption[], null>({
    url: endpoint,
    body: existBody,
    skip: dependOn ? !dependOn.value : false,
  });

  const handleRefetch = () => {
    refetch();
  };

  const transformDataToTree = (data: ITreeSelectOption[]) => {
    return data?.map((item) => {
      return showId
        ? {
            key: item._SelectId,
            title: `${item._SelectId} - ${item._SelectDisplay}`,
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

  const findOptionByValue = (data: IData[], value: number): number | null => {
    for (const item of data) {
      if (item.value === value) return value;
      if (item.children) {
        const found = findOptionByValue(item.children, value);
        if (found) return value;
      }
    }
    return null;
  };
  const setOptionsDisabledStatus = (
    options: IData[],
    values: number[],
    disabled: boolean
  ): IData[] => {
    return options.map((item) => {
      const children = item.children
        ? setOptionsDisabledStatus(item.children, values, false)
        : undefined;

      return {
        ...item,
        children,
      };
    });
  };

  const handleTreeSelectChange = (selectedValues: number[]) => {
    const selectedItems = selectedValues.map((val) =>
      findOptionByValue(availableOptions, val)
    );

    const newAvailable = setOptionsDisabledStatus(
      availableOptions,
      selectedValues,
      true
    );

    setAvailableOptions(newAvailable);
    dispatch(
      setPageData({
        name,
        value: selectedItems,
      })
    );

    onChange?.(selectedItems, selectedItems as any, null);
  };

  const handleRemoveItem = (value: number) => {
    const newSelectedList = selectedItems.filter((item) => item !== value);

    const newAvailable = setOptionsDisabledStatus(
      availableOptions,
      [value],
      false
    );

    setAvailableOptions(newAvailable);
    dispatch(
      setPageData({
        name,
        value: newSelectedList,
      })
    );

    onChange?.(newSelectedList, newSelectedList, null);
  };

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
        if (item.children?.length > 0) {
          search(item.children);
        }
      });
    };
    search(data);
    return results;
  };

  const options = useMemo(() => {
    if (!data?.Data) return [];
    return transformDataToTree(data.Data);
  }, [data?.Data]);

  useEffect(() => {
    if (!Array.isArray(props.value) || !props.value.length || !options.length)
      return;

    const preSelectedItems = props.value.map((val) =>
      findOptionByValue(options, val)
    );

    if (JSON.stringify(preSelectedItems) !== JSON.stringify(selectedItems)) {
      dispatch(
        setPageData({
          name,
          value: preSelectedItems,
        })
      );
    }
  }, [props.value, options]);

  useEffect(() => {
    if (!onOptionsChange) return;
    onOptionsChange(options);
  }, [options?.length]);

  useEffect(() => {
    setTreeData(options);
    setAvailableOptions(options);
  }, [options]);

  return (
    <div className="flex flex-col gap-1 w-full">
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
        value={[]}
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
        treeData={availableOptions}
        onChange={handleTreeSelectChange}
        onSearch={(value) => {
          const correctOption = findOptionWithTitle(options, value);
          if (correctOption.length === 1) {
            if (onSearchPhrase) {
              return onSearchPhrase(
                correctOption[0]?.value,
                correctOption[0]?.title
              );
            }
          }
        }}
        multiple
        tagRender={() => null}
        addButton={addButton}
      />

      <div className="flex flex-col gap-2 p-2 border border-gray-gray5 rounded  overflow-auto"
       style={{ height: listHeight }}
      >
        {selectedItems?.map((item: number, idx: number) => {
          const element = findItemInNestedData<IData>(treeData, "value", item);
          const def = defOption?.find((el) => el?.value === item)?.name;
          return (
            <div
              key={idx}
              className="flex justify-between items-center bg-gray-gray3 p-1 rounded text-xs"
            >
              <span>{element?.title || element?.value || def}</span>
              <button
                className="hover:bg-red-300 p-1 rounded text-white cursor-pointer"
                onClick={() => handleRemoveItem(element?.value)}
              >
                <TrashBin />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
