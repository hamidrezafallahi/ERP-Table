"use client";
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { Pagination } from 'antd';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  LeftChevron,
  RightChevron,
} from '@components/atoms/iconComponents';
import type {
  IChildHandle,
} from '@components/molecules/accounting/voucher/mobileGrid/type';
import { DetailDataGrid } from '@components/molecules/detailDataGridCustom';
import { YearPlanResult } from '@components/molecules/yearPlan';
import { YearPlanForm } from '@components/molecules/yearPlan/form';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import type { IRequest } from '@services/acc/voucher/type';
import type { IYearPlanDetails } from '@services/acc/yearPlanDetails/type';
import { useGetData } from '@services/base';
import { IYearPlan } from '@services/prd/yearPlan/type';
import {
  setAllPageData,
  setPageData,
  setPageInfo,
} from '@slice/pages';
import { hasStoredValue } from '@utils/core';

import { useFormConfig } from './config';
import type { ITotal } from './type';

export const YearPlan = ({ form }) => {
  const { activePage, fullScreen, minimizePanel, match } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find(
        (item) => item.isActive === true
      ),

      fullScreen: state.withPersist.config.fullScreen,
      minimizePanel: state.withoutPersist.container.minimize,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );
  const dispatch = useDispatch();
  const params = useSearchParams();
  const t = useTranslations();
  const id = Number(params.get("id"));
  const isEdit = id ? true : false;
  const titleKey = "Year";
  const fieldKey = "YearPlanId";
  const repoViewId = 150015;
  const detailsRepoViewId = 150016;
  const getUrl = "/api/prd/select/yearPlan";
  const getDetailUrl = "/api/prd/select/yearPlan/Item";
  const createUrl = "/api/prd/insert/yearPlan";
  const updateUrl = "/api/prd/update/yearPlan";
  const deleteUrl = "api/prd/delete/yearPlan";
  const detailDragUrl = "api/prd/changeRowNumber/yearPlan/Item";
  const alternateKey = "yearPlanItemId";
  const detailCaption = "";
  const detailKey = "Details";

  const storedData = activePage?.pageData;

  const detailInitial = activePage?.pageData?.find(
    (item) => item.name === "Details"
  )?.value;

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const isReadOnly = mode === "showHistory";

  const [isShowForm, setShowForm] = useState(true);
  const [total, setTotal] = useState<ITotal[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [detailsInitialData, setDetailsInitialData] = useState(
    detailInitial ? detailInitial : []
  );
  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const formHeight = 400;
  const recordsPerPage = !match
    ? 10
    : Math.floor((deviceHeight - formHeight) / recordHeight);

  const handlePaginationChange = (page: number) => {
    setPageNumber(page);
  };
  const { formConfig, columnConfig } = useFormConfig();
  const pageId = activePage?.pageId;
  const info = {
    addEndpoint: createUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };

  const { data } = useGetData<IYearPlan[], IRequest>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      Id: id,
      ShowBookmarked: true,
      ShowTags: true,
    },
    skip: !id,
    id: id,
  });

  const { data: detailsData, isFetching } = useGetData<
    IYearPlanDetails[],
    IRequest
  >({
    url: getDetailUrl,
    body: {
      RepoViewId: detailsRepoViewId,
      YearPlanId: Number(id),
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordsPerPage,
      },
    },
    skip: !id,
    id: id,
  });
  const { data: detailsTotal } = useGetData<null, null>({
    url: getDetailUrl,
    body: {
      RepoViewId: detailsRepoViewId,
      YearPlanId: Number(id),
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordsPerPage,
        OnlyTotalCount: true,
      },
    },
    skip: !id,
    id: id,
  });

  const childRef = useRef<IChildHandle>(null);

  const handleAddNew = () => {
    const index = 0;
    if (childRef.current) {
      childRef.current.mobileHandleAdd(index);
    }
  };

  const calculateParameter = (detailsData: IYearPlanDetails[]) => {
    const MONTH_KEYS = [
      "Month1",
      "Month2",
      "Month3",
      "Month4",
      "Month5",
      "Month6",
      "Month7",
      "Month8",
      "Month9",
      "Month10",
      "Month11",
      "Month12",
    ] as const;

    type MonthKey = (typeof MONTH_KEYS)[number];

    const getMonthTotals = (detailData: IYearPlanDetails[]) => {
      return MONTH_KEYS.map((monthKey) => {
        let sum = 0;

        for (const item of detailData) {
          const value = item[monthKey as MonthKey];
          if (typeof value === "number") sum += value;
        }

        return { key: monthKey, value: sum };
      });
    };

    const finalData = getMonthTotals(detailsData);
    setTotal(finalData);

    return finalData;
  };

  const defaultValue = id ? data?.Data && data?.Data[0] : null;

  useEffect(() => {
    const hasStored = Array.isArray(storedData) && storedData.length > 0;

    let formData;

    if (defaultValue !== null && defaultValue) {
      const correctDefaultValue = {
        ...defaultValue,
      };

      formData = formConfig.map((item) => {
        const storedEntry = storedData?.find((i) => i.name === item.name);
        const storedDataValue = storedEntry?.value;
        const storedDataOriginalValue = storedEntry?.originalValue;

        const useStoredValue = hasStoredValue(storedDataValue);
        const useStoredOriginal = hasStoredValue(storedDataOriginalValue);

        const correctValue = useStoredValue
          ? storedDataValue
          : hasStoredValue(correctDefaultValue[item.name])
          ? correctDefaultValue[item.name]
          : item?.value;

        const correctOriginalValue = useStoredOriginal
          ? storedDataOriginalValue
          : hasStoredValue(correctDefaultValue[item.name])
          ? correctDefaultValue[item.name]
          : item?.originalValue;

        return {
          ...item,
          value: correctValue,
          originalValue: correctOriginalValue,
          isTitleField: item.name === titleKey,
        };
      });

      formData.push({
        name: fieldKey,
        caption: "MainIdField",
        value: id,
        originalValue: id,
        isTitleField: false,
        type: "",
      });
    } else if (hasStored) {
      formData = storedData;
    } else {
      formData = formConfig.map((item) => ({
        ...item,
        isTitleField: item.name === titleKey,
        value: item?.value,
        originalValue: item?.originalValue,
      }));
    }

    const shouldDispatch =
      !hasStored || JSON.stringify(formData) !== JSON.stringify(storedData);
    if (shouldDispatch) {
      dispatch(setAllPageData(formData));
    }

    dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
  }, [defaultValue, pageId, storedData]);

  useEffect(() => {
    if (detailsData && detailsData?.Data?.length > 0) {
      const correctDetailData = detailsData?.Data?.map((item) => {
        const data = {
          key: item[alternateKey],

          ...item,
        };
        return data;
      });

      dispatch(
        setPageData({
          name: detailKey,
          value: correctDetailData,
          originalValue: correctDetailData,
        })
      );
      if (detailInitial && detailInitial?.length > 0) {
        setDetailsInitialData([...correctDetailData, ...detailInitial]);

        dispatch(
          setPageData({
            name: detailKey,
            value: [...correctDetailData, ...detailInitial],
            originalValue: [...correctDetailData, ...detailInitial],
          })
        );
      } else {
        setDetailsInitialData(correctDetailData);
        dispatch(
          setPageData({
            name: detailKey,
            value: correctDetailData,
            originalValue: correctDetailData,
          })
        );
      }
    } else {
      if (detailInitial && detailInitial?.length > 0) {
        setDetailsInitialData(detailInitial);
      }
    }
  }, [detailsData?.Data, pageId]);

  return (
    <div
      className={`${
        !match
          ? "!h-[calc(100dvh-160px)] overflow-y-auto hidden-show-scrollBar"
          : "h-fit"
      }
       flex flex-col gap-4 px-1 w-full `}
    >
      <div
        className={`${
          !match ? "grid lg:grid-cols-3 grid-cols-1 gap-y-4 lg:gap-2" : ""
        } flex flex-col px-1 w-full`}
      >
        <div
          className={`${
            isShowForm
              ? "opacity-100 transform translate-y-1"
              : "opacity-0 transform translate-y-0 pointer-events-none"
          }  transition-all duration-500 ease-in-out pb-2`}
        >
          {isShowForm && <YearPlanForm form={form} isEdit={isEdit} />}
        </div>
        <hr className="my-12" />

        <div className="flex flex-col gap-2 col-span-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex justify-between items-center w-full">
              {!match && (
                <>
                  <CustomButton
                    type="text"
                    className="!bg-black-black8 hover:bg-black-black8 focus-within:bg-black-black8 focus:bg-black-black8 active:bg-black-black8 px-3 py-1 border rounded !text-white text-xs"
                    onClick={handleAddNew}
                  >
                    {t("general.add")}
                  </CustomButton>
                </>
              )}
            </div>
          </div>

          <div
            className={`
              ${isReadOnly ? "opacity-55 cursor-not-allowed " : ""}
              
              
              ${
                fullScreen
                  ? "w-full"
                  : !match
                  ? "w-full"
                  : `${
                      minimizePanel
                        ? "w-fit max-w-[calc(100dvw-320px)]"
                        : "w-fit max-w-[calc(100dvw-570px)]"
                    }`
              } ${
              !match ? "h-full" : "h-[calc(100dvh-680px)]"
            }   flex hidden-show-scrollBar transition-all duration-200 flex-col justify-between gap-2`}
          >
            {match ? (
              <div className="flex w-full">
                <DetailDataGrid.Desktop<IYearPlanDetails>
                  isEdit={isEdit}
                  fieldKey={alternateKey}
                  alternateKey={alternateKey}
                  detailKey={detailKey}
                  detailCaption={detailCaption}
                  dragUrl={detailDragUrl}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnConfig}
                  currentPage={pageNumber}
                  contentHeight={680}
                  additionalFunction={calculateParameter}
                />
              </div>
            ) : (
              <DetailDataGrid.Mobile<IYearPlanDetails>
                isEdit={isEdit}
                fieldKey={alternateKey}
                alternateKey={alternateKey}
                detailKey={detailKey}
                detailCaption={detailCaption}
                detailInitialData={detailsInitialData ?? []}
                columnsConfig={columnConfig}
                currentPage={pageNumber}
                contentHeight={190}
                isLoading={isFetching}
                ref={childRef}
                setPage={setPageNumber}
                setShowForm={setShowForm}
                totalCount={detailsTotal?.TotalCount}
                additionalFunction={calculateParameter}
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {match &&
          detailsTotal?.TotalCount &&
          activePage?.pageData?.length > 0 && (
            <Pagination
              className=""
              prevIcon={
                <CustomButton className="m-0 p-0 rounded w-fit">
                  <RightChevron />
                </CustomButton>
              }
              nextIcon={
                <CustomButton className="m-0 p-0 w-fit">
                  <LeftChevron />
                </CustomButton>
              }
              current={pageNumber}
              jumpNextIcon={<span>...</span>}
              jumpPrevIcon={<span>...</span>}
              pageSize={recordsPerPage}
              total={detailsTotal?.TotalCount}
              showSizeChanger={false}
              onChange={handlePaginationChange}
              showTitle={false}
            />
          )}
        {match && (
          <YearPlanResult
            fullScreen={fullScreen}
            minimizePanel={minimizePanel}
            match={match}
            columnSums={total}
          />
        )}
      </div>
    </div>
  );
};
