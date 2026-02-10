import { useMemo, useState } from "react";

import { Collapse, Spin } from "antd";
import moment from "moment-jalaali";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import {
  CustomButton,
  CustomSelect,
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import {
  CloseCircle,
  DownChevron,
  SpinIcon,
} from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import { useGetConditionallyMutation } from "@services/base";
import { IBaseQueryResponse, IFilter } from "@services/base/type";
import { setReportData } from "@slice/config";
import type { IFormField } from "@type/elementType";

export const FilterData = ({ dataSources }) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { locale, modalIsFullScreen } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      modalIsFullScreen: state.withPersist.config.modalIsFullscreen,
    }),
    shallowEqual,
  );

  interface IReportFilter {
    filters: IFilter[];
    dataSourceName: string;
  }

  const [dataFilters, setDataFilters] = useState<IReportFilter[]>([]);

  const [pageRecordCount, setPageRecordCount] = useState<number>(2000);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const [getReportData, { isLoading }] = useGetConditionallyMutation();

  const filterFields = useMemo(() => {
    return (
      dataSources?.flatMap((item) => {
        let correctParameter: any[] = [];
        try {
          correctParameter = JSON.parse(item?.Parameter || "[]");
        } catch (err) {
          // console.error("Failed to parse:", err);
        }

        return {
          dataSourceName: item.DataSourceName,
          dataSourceTitle: item.DataSourceTitle,
          fields: correctParameter.map((el) => ({
            dataSourceName: item.DataSourceName,
            dataSourceTitle: item.DataSourceTitle,
            fieldName: el.fieldName,
            label: el.fieldCaption,
            type: el.fieldType,
            fieldType: el.fieldType === "string" ? "ftContains" : "ftEqual",
            valueOption: el.valueOption,
          })),
        };
      }) || []
    );
  }, [dataSources]);

  const handleChange = (
    fieldName: string,
    value: string,
    fieldType: IFilter["FilterType"],
    dataSourceName: string,
  ) => {
    setDataFilters((prev) => {
      // find the target dataSource entry
      const existingSource = prev.find(
        (el) => el.dataSourceName === dataSourceName,
      );

      if (existingSource) {
        const existingFilter = existingSource.filters.find(
          (f) => f.ColName === fieldName,
        );

        let updatedFilters: IFilter[];
        if (existingFilter) {
          // update existing filter
          updatedFilters = existingSource.filters.map((f) =>
            f.ColName === fieldName ? { ...f, Value: value } : f,
          );
        } else {
          // add new filter
          updatedFilters = [
            ...existingSource.filters,
            { ColName: fieldName, Value: value, FilterType: fieldType },
          ];
        }

        // update only the matching dataSource
        return prev.map((el) =>
          el.dataSourceName === dataSourceName
            ? { ...el, filters: updatedFilters }
            : el,
        );
      } else {
        // create a new dataSource entry with this filter
        return [
          ...prev,
          {
            dataSourceName,
            filters: [
              { ColName: fieldName, Value: value, FilterType: fieldType },
            ],
          },
        ];
      }
    });
  };
  const handleRemove = (field: IFormField, dataSourceName: string) => {
    setDataFilters((prev) =>
      prev.map((ds) =>
        ds.dataSourceName === dataSourceName
          ? {
              ...ds,
              filters: ds.filters.filter((f) => f.ColName !== field.fieldName),
            }
          : ds,
      ),
    );
  };

  const handleGetReportData = async () => {
    if (!dataSources?.length) return;

    for (const { Endpoint, DataSourceName, RepoId } of dataSources) {
      try {
        const reportData: IBaseQueryResponse<any[]> = await getReportData({
          url: Endpoint,
          body: {
            Filters: {
              FilterInfo: dataFilters?.find(
                (item) => item.dataSourceName === DataSourceName,
              )?.filters,
              ShowOnlyBookmarked: false,
              TagIdsFilter: null,
            },
            OrderInfo: [],
            RepoViewId: RepoId,
            ShowMode: 10,
            ShowTags: true,
            ShowBookmarked: true,
            PagingInfo: {
              PageNumber: pageNumber,
              PageRecordCount: pageRecordCount,
            },
            FullSearchPhrase: "",
          },
        }).unwrap();

        dispatch(
          setReportData({
            dataSourceName: DataSourceName,
            reportData:
              reportData?.Result === "Success" && reportData?.Data?.length > 0
                ? reportData.Data
                : [],
          }),
        );
      } catch {
        dispatch(
          setReportData({ dataSourceName: DataSourceName, reportData: [] }),
        );
      }
    }
  };

  const renderFormField = (field: IFormField, dataSourceName: string) => {
    const filters =
      dataFilters.find((item) => item.dataSourceName === dataSourceName)
        ?.filters || [];
    switch (field.type) {
      case "string":
        return (
          <InputText
            name={field.fieldName}
            // placeholder={t("general.enterValue")}
            allowClear={{
              clearIcon: (
                <span onClick={() => handleRemove(field, dataSourceName)}>
                  <CloseCircle />
                </span>
              ),
            }}
            value={filters.find((i) => i.ColName === field.fieldName)?.Value}
            size="middle"
            className={`flex items-center border-1 hover:border-gray-gray5 focus:border-gray-gray5 active:border-gray-gray5  rounded-md ring-0 focus:ring-0 min-w-[152px] text-sm`}
            onChange={(event) => {
              if (event.target.value.length > 2) {
                handleChange(
                  field.fieldName,
                  event.target.value,
                  field.fieldType as any,
                  dataSourceName,
                );
              }
            }}
          />
        );
      case "number":
        return (
          <InputText
            name={field.fieldName}
            // placeholder={t("general.enterValue")}
            allowClear={{
              clearIcon: (
                <span onClick={() => handleRemove(field, dataSourceName)}>
                  <CloseCircle />
                </span>
              ),
            }}
            value={filters.find((i) => i.ColName === field.fieldName)?.Value}
            size="middle"
            className="flex items-center border-1 hover:border-gray-gray5 focus:border-gray-gray5 active:border-gray-gray5 rounded-md ring-0 focus:ring-0 min-w-[152px] text-sm"
            onChange={(event) => {
              if (
                event.target.value &&
                event.target.value.length > 0 &&
                event.target.value !== ""
              ) {
                handleChange(
                  field.fieldName,
                  event.target.value,
                  field.fieldType as any,
                  dataSourceName,
                );
              }
            }}
          />
        );
      case "date": {
        const value = filters.find((i) => i.ColName === field.fieldName)?.Value;
        const temp = value
          ? locale === "fa"
            ? moment(value).valueOf()
            : moment(value).utc().valueOf()
          : undefined;

        return (
          <NewDatePicker
            onChange={(date) => {
              handleChange(
                field.fieldName,
                date as any,
                field.fieldType as any,
                dataSourceName,
              );
            }}
            defaultValue={temp}
          />
        );
      }

      case "select":
        if (field?.valueOption.Options) {
          const options = field?.valueOption.Options.map((item) => {
            return {
              label: item.caption,
              value: item.value,
              title: item.caption,
            };
          });

          const currentValue = filters.find(
            (i) => i.ColName === field.fieldName,
          )?.Value;

          const defaultValue = options.find((i) => i.value === currentValue);
          return (
            <CustomSelect
              className="w-[150px]"
              value={defaultValue}
              // placeholder={t("general.selectField")}
              onChange={(value) => {
                if (value) {
                  handleChange(
                    field.fieldName,
                    value,
                    field.fieldType as any,
                    dataSourceName,
                  );
                }
              }}
              options={options}
              onClear={() => handleRemove(field, dataSourceName)}
            />
          );
        }
        return (
          <DynamicSelect
            allowClear={{
              clearIcon: <CloseCircle />,
            }}
            onClear={() => handleRemove(field, dataSourceName)}
            value={filters.find((i) => i.ColName === field.fieldName)?.Value}
            dynamicValue={field?.valueOption}
            className="rounded w-full"
            onChange={(value) => {
              if (value) {
                handleChange(
                  field.fieldName,
                  value?.toString(),
                  field.fieldType as any,
                  dataSourceName,
                );
              }
            }}
          />
        );

      default:
        return null;
    }
  };
  const { Panel } = Collapse;

  return (
    <div
      className={`${
        modalIsFullScreen
          ? "flex flex-col justify-between"
          : "flex flex-col justify-between p-2 border-b-2"
      } gap-2 `}
    >
      <div
        className={`${
          modalIsFullScreen ? " flex flex-col" : "flex h-[170px] overflow-auto"
        } gap-2 `}
      >
        <fieldset
          className={`flex flex-col flex-1 gap-2 overflow-auto py-4 px-2 border rounded ${
            modalIsFullScreen ? "max-h-[calc(100dvh-320px)]" : "w-[842px]"
          } `}
        >
          <legend>{t("general.filters")}</legend>
          {filterFields.map((item, index) => (
            <Collapse
              expandIcon={({ isActive }) => (
                <div className={isActive ? "rotate-180" : ""}>
                  <DownChevron />
                </div>
              )}
              expandIconPosition="end"
              style={{
                backgroundColor: "white",
                padding: 0,
                margin: 0,
              }}
              bordered={false}
              accordion
              key={index}
            >
              <Panel
                className="bg-gray-gray5 dark:bg-gray-gray7"
                header={item?.dataSourceTitle}
                key={index}
              >
                <div
                  className={`${
                    modalIsFullScreen
                      ? "flex flex-col max-h-[calc(100dvh-250px)] h-fit overflow-auto"
                      : "grid grid-cols-4 flex-1"
                  } gap-2 transition-transform duration-200 bg-white dark:bg-gray-gray85 ease-in-out p-2`}
                >
                  {item.fields?.map((field, idx: number) => (
                    <div key={idx} className="min-w-[150px]">
                      <span className="font-bold text-gray-gray10 dark:text-white text-xs">
                        {field.label}
                      </span>
                      {renderFormField(field, field.dataSourceName)}
                    </div>
                  ))}
                </div>
              </Panel>
            </Collapse>
          ))}
        </fieldset>

        <fieldset className="p-2 border rounded w-[300px]">
          <legend>{t("general.paging")}</legend>
          <div className="flex flex-col justify-end">
            <div>
              <span className="font-bold text-gray-gray10 dark:text-white text-xs">
                {t("general.pageNumber")}
              </span>
              <CustomInputNumber
                controls={false}
                value={pageNumber}
                max={2000}
                min={1}
                onChange={(value) => setPageNumber(+value)}
              />
            </div>
            <div>
              <span className="font-bold text-gray-gray10 dark:text-white text-xs">
                {t("general.recordNumber")}
              </span>
              <CustomInputNumber
                controls={false}
                value={pageRecordCount}
                max={2000}
                min={1}
                onChange={(value) => {
                  if (value) {
                    if (Number(value) < 1) {
                      setPageRecordCount(1);
                    } else if (Number(value) > 2000) {
                      setPageRecordCount(2000);
                    } else {
                      setPageRecordCount(+value);
                    }
                  }
                }}
              />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="flex justify-end items-end self-end gap-2">
        <CustomButton
          type="text"
          onClick={() => {
            handleGetReportData();
          }}
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
        >
          <div className="min-w-[40px]">
            {isLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : (
              t("general.show")
            )}
          </div>
        </CustomButton>
      </div>
    </div>
  );
};
