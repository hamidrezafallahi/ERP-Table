import { Dispatch, SetStateAction, useMemo, useState } from "react";

import { Collapse, CollapseProps, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton, CustomModal } from "@components/atoms/defaultElements";
import {
  DownChevron,
  EditPencil,
  QuickFilterIcon,
} from "@components/atoms/iconComponents";
import QuickFilters from "@components/molecules/quickFilters";
import { useAppSelector } from "@redux/index";
import { setViewData } from "@slice/pages";
import type { IFormField } from "@type/elementType";
import type { IToolbarDetailConfig } from "@type/toolbar";

import type { IModalObject } from "./type";

interface IProps {
  minimize?: boolean;
  setMinimize?: Dispatch<SetStateAction<boolean>>;
}
export default function Filters({ ...props }: IProps) {
  const { minimize, setMinimize } = props;
  const dispatch = useDispatch();
  const t = useTranslations();
  const [collapseFilters, setCollapseFilters] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
    }),
    shallowEqual,
  );
  const configData = activePage?.toolbarData?.List?.Config;
  const config = configData && JSON.parse(configData);
  const editFilters: IModalObject = {
    title: (
      <div>
        <div className="font-medium text-black-black5">
          {t("sidebar.editFiltersModalHeader")}
        </div>
        <div className="font-normal text-gray-gray85 text-xs">
          {t("sidebar.editFiltersModalDesc")}
        </div>
      </div>
    ),
    content: (
      <>
        <div className="border-gray-gray7 border-b">
          {activePage?.TagsInfo?.map((item, index) => (
            <div key={index}>{item.Title}</div>
          ))}
        </div>
      </>
    ),
  };

  const quickFilter = useMemo(
    () => config?.filter((item: IToolbarDetailConfig) => item.inQuickFilter),
    [config],
  );

  const quickFilterFields = useMemo(
    () =>
      quickFilter?.map((item) => ({
        fieldName: item.fieldName,
        label: item.fieldCaption,
        type: item.fieldType,
        fieldType: item.fieldType === "string" ? "ftContains" : "ftEqual",
        valueOption: item.valueOption,
      })),
    [quickFilter],
  );

  const handleFilterChange = (
    fieldName: string,
    value: string,
    fieldType: string,
  ) => {
    if (value) {
      const existFilter = activePage.viewData?.Filters?.FilterInfo?.find(
        (i) => i.ColName === fieldName,
      );

      if (existFilter) {
        const filters = activePage.viewData?.Filters?.FilterInfo?.map((i) =>
          i.ColName === fieldName ? { ...existFilter, Value: value } : i,
        );

        dispatch(
          setViewData({
            ...activePage.viewData,
            Filters: {
              ...activePage.viewData.Filters,
              FilterInfo: filters,
            },
            PagingInfo: {
              PageNumber: 1,
              PageRecordCount: activePage.viewData?.PagingInfo?.PageRecordCount,
            },
          }),
        );
      } else {
        dispatch(
          setViewData({
            ...activePage.viewData,
            Filters: {
              ...activePage.viewData.Filters,
              FilterInfo: [
                ...activePage.viewData.Filters.FilterInfo,
                { ColName: fieldName, Value: value, FilterType: fieldType },
              ],
            },
            PagingInfo: {
              PageNumber: 1,
              PageRecordCount: activePage.viewData?.PagingInfo?.PageRecordCount,
            },
          }),
        );
      }
    }
  };

  const handleRemoveFilter = (field: IFormField) => {
    const newFilter = activePage.viewData?.Filters?.FilterInfo?.filter(
      (i) => i.ColName !== field.fieldName,
    );

    dispatch(
      setViewData({
        ...activePage.viewData,
        Filters: {
          ...activePage.viewData.Filters,
          FilterInfo: newFilter,
        },
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: activePage.viewData?.PagingInfo?.PageRecordCount,
        },
      }),
    );
  };
  const handleEditFilters = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenModal(true);
  };
  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <div
          className={` flex items-center  ${
            minimize ? "justify-center " : "justify-between "
          }  `}
          onClick={() => {
            setCollapseFilters(!collapseFilters);
            setMinimize?.(false);
          }}
        >
          <div
            className="flex items-center gap-2 text-gray-gray10 dark:text-white"
            title="فیلتر ها"
          >
            {minimize ? (
              <QuickFilterIcon
                config={{
                  width: 24,
                  height: 24,
                }}
              />
            ) : (
              <QuickFilterIcon config={{ width: 24, height: 24 }} />
            )}

            <span
              className={` ${
                minimize ? "hidden" : "text-sm text-gray-gray10 dark:text-white"
              }`}
            >
              {t("general.filters")}
            </span>
            <span
              className={`
              ${collapseFilters && "rotate-180 "} ${
                minimize
                  ? "hidden"
                  : "transition-transform duration-200 ease-in-out"
              }
              `}
            >
              <DownChevron />
            </span>
          </div>
          <CustomButton
            type="text"
            className={`${minimize ? "hidden" : "p-1"}`}
            onClick={handleEditFilters}
          >
            <EditPencil />
          </CustomButton>
        </div>
      ),
      children: (
        <>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              collapseFilters
                ? "max-h-[500px] opacity-100"
                : "max-h-0 opacity-0"
            }
                        ${minimize && "hidden"}

            `}
          >
            <QuickFilters
              fields={quickFilterFields}
              handleChange={handleFilterChange}
              handleRemove={handleRemoveFilter}
            />
          </div>
        </>
      ),
      showArrow: false,
    },
  ];

  return (
    <>
      {activePage?.toolbarData?.List ? (
        <Collapse
          className={`[&>.ant-collapse-item>.ant-collapse-header]:!p-[1px] !text-sm relative w-full`}
          defaultActiveKey={["1"]}
          style={{
            backgroundColor: "white",
            padding: 0,
            margin: 0,
          }}
          items={items}
          bordered={false}
        />
      ) : (
        <Skeleton.Button
          active={true}
          size={"default"}
          shape={"default"}
          block={true}
        />
      )}
      <CustomModal
        title={editFilters.title}
        content={editFilters.content}
        closeModal={() => {
          setOpenModal(false);
        }}
        isModalOpen={openModal}
      />
    </>
  );
}
