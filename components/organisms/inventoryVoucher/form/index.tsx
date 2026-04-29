"use client";
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Form,
  Pagination,
} from 'antd';
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
import { DetailDataGrid } from '@components/molecules/detailDataGrid';
import type {
  IChildHandle,
} from '@components/molecules/detailDataGrid/mobile/type';
import {
  InventoryVoucherHeaderForm,
} from '@components/molecules/inventoryVoucher';
import { useAppSelector } from '@redux/index';
import type { IPlaceConfig } from '@services/auth/base/type';
import {
  useGetConditionallyMutation,
  useGetData,
} from '@services/base';
import type { IDetailColumnConfig } from '@services/generalType/type';
import type {
  IInventoryVoucherDetail,
} from '@services/inv/inventoryVoucherDetail/type';
import type { IRequest } from '@services/sale/standardSalesInvoice/type';
import {
  setAllPageData,
  setPageCaption,
  setPageData,
  setPageInfo,
} from '@slice/pages';
import { convertDate } from '@utils/core';

import {
  columnConfig as colConfig,
  formConfig,
} from './config';

export const InventoryVoucherForm = ({ form }) => {
  const [columnConfig] = useState(colConfig);
  const { activePage, fullScreen, minimizePanel, match, init, locale } =
    useAppSelector(
      (state) => ({
        activePage: state.withPersist.pages?.find((item) => item.isActive),
        fullScreen: state.withPersist.config.fullScreen,
        minimizePanel: state.withoutPersist.container.minimize,
        init: state?.withPersist?.init,
        locale: state.withPersist.config.lang,
        // listPage intentionally omitted (not used here)
        match: state.withPersist.config.initMatch,
      }),
      shallowEqual
    );

  const dispatch = useDispatch();
  const isEdit = init?.Id ? true : false;
  const titleKey = "VoucherNumber";
  const fieldKey = "VoucherHeaderId";
  const alternateKey = "VoucherTypeId";
  const detailCaption = "اقلام";
  const detailKey = "Details";
  const repoViewId = 2002;
  const detailRepoViewId = 2003;
  const detailDragUrl = "";
  const getUrl = "api/inv/select/voucher/header";
  const getDetailUrl = "api/inv/select/voucher/detail";
  const addUrl = "api/inv/insert/voucher";
  const updateUrl = "api/inv/update/voucher";
  const deleteUrl = "api/inv/delete/voucher";
  const pageId = activePage?.pageId;
  const info = {
    addEndpoint: addUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };

  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const formHeight = 580;
  const mobileRecordsPerPage = 10;

  const params = useSearchParams();
  const id = Number(params.get("id"));
  const vti =params.get("VoucherTypeId");
  const storedData = activePage?.pageData;

  const voucherTypeId =params.get("VoucherReference")
  // const detailRequiredKey = "voucherId";
  // const detailRequiredValue = activePage?.pageData?.find(
  //   (item) => item.name === detailRequiredKey
  // );

  const detailInitial = activePage?.pageData?.find(
    (item) => item.name === detailKey
  )?.value;

  type Condition = {
    hasLocation: boolean;
    batchId: boolean;
    batchNo: boolean;
    expireDate: boolean;
  };
  const perPageCount = 5;
  const [headerId, setHeaderId] = useState(null);
  const [detailsInitialData, setDetailsInitialData] = useState([]);
  const [columnsConfig, setColumnsConfig] =
    useState<IDetailColumnConfig[]>(columnConfig);
  const [locationMap, setLocationMap] = useState<Record<number, Condition>>({});
  const locationRequests = useRef<Record<number, boolean>>({});
  const [pageNumber, setPageNumber] = useState(1);

  const { data } = useGetData<IInventoryVoucherDetail[], IRequest>({
    url: getUrl,
    body: {
      Id: id,
    },
    skip: !id,
    // id: id,
  });

  const recordsPerPage = !match
    ? mobileRecordsPerPage
    : Math.floor((deviceHeight - formHeight) / recordHeight);

  const { data: detailsData, isFetching: isLoading } = useGetData<
    IInventoryVoucherDetail[],
    IRequest
  >({
    url: getDetailUrl,
    body: {
      HeaderId: Number(headerId),
      RepoViewId: 70003,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
    skip: !id || !headerId,
    // id: id,
  });

  const { data: detailsTotal } = useGetData<null, null>({
    url: getDetailUrl,
    body: {
      HeaderId: Number(headerId),
      RepoViewId: 70003,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
        OnlyTotalCount: true,
      },
    },
    skip: !id || !headerId,
    id: id,
  });

  const { data: renderCondition } = useGetData<IPlaceConfig[], null>({
    url: `/api/mng/select/placeConfigValue`,
    body: {},
  });

  const childRef = useRef<IChildHandle>(null);

  const handlePaginationChange = (page: number) => {
    setPageNumber(page);
  };
  const measurementUnitsNumber =
    renderCondition?.Data[0]?.SaleConfig?.InvoiceMeasurementUnits;

  const StockId = storedData?.find((i) => i.name == "StockId")?.value;

  const [getIndependentValue] = useGetConditionallyMutation();

  // conditionRenderer is expected to be synchronous; return a config immediately
  // but still trigger an async check to refine/side-effect if needed.
  const renderConditionalColumn = (
    conditionalValue: number,
    fieldName: string,
    initialRenderCondition: Record<string, boolean>
  ): Record<string, boolean> => {
    // If there's no conditional value, just return the initial condition
    if (!conditionalValue) return initialRenderCondition;

    // If we already have a cached value for this GoodsId, use it

    const locationCached = locationMap[conditionalValue];
    // Start an async request only if not already in-flight and not cached
    if (
      locationCached === undefined &&
      !locationRequests.current[conditionalValue]
    ) {
      locationRequests.current[conditionalValue] = true;
      getIndependentValue({
        url: `/api/inv/check/GoodsInfo`,
        body: { GoodsId: conditionalValue, StockId },
      })
        .unwrap()
        .then((result: any) => {
          const hasLocation = !!(
            result?.Result === "Success" && result?.Data?.[0]?.HasLocation
          );
          const hasBatch = !!(
            result?.Result === "Success" && result?.Data?.[0]?.HasBatch
          );
          const isSimpleGood = !!(
            result?.Result === "Success" && result?.Data?.[0]?.IsSimpleGood
          );
          const hasExpire = !!(
            result?.Result === "Success" && result?.Data?.[0]?.HasExpireDate
          );
          setLocationMap((prev) => ({
            ...prev,
            [conditionalValue]: {
              hasLocation: hasLocation,
              batchId: false,
              batchNo: false,
              expireDate: hasExpire,
            },
          }));

          //is batch true / inout=0-1 /need reference? select/ api && voucherTypeId in init data :false? isSimple ? text

          const internal =params.get("internal")
          const NeedReference =params.get("NeedReference")
          if (hasBatch && internal) {
            if (NeedReference) {
              setLocationMap((prev) => ({
                ...prev,
                [conditionalValue]: {
                  ...prev[conditionalValue],
                  batchId: true,
                },
              }));
            } else if (isSimpleGood) {
              setLocationMap((prev) => ({
                ...prev,
                [conditionalValue]: {
                  ...prev[conditionalValue],
                  batchNo: true,
                },
              }));
            }
          }
        })
        .catch(() => {
          setLocationMap((prev) => ({
            ...prev,
            [conditionalValue]: {
              batchId: false,
              batchNo: false,
              hasLocation: false,
              expireDate: false,
            },
          }));
        })
        .finally(() => {
          delete locationRequests.current[conditionalValue];
        });
    }

    const hasBatchElement =
      (locationCached?.batchId || locationCached?.batchNo) ?? !!id;

    // Build condition object based on measurement units and cached hasLocation
    if (measurementUnitsNumber === 1) {
      return {
        ...initialRenderCondition,
        Unit1Id: true,
        Quantity1: true,
        InventoryLocationId: locationCached?.hasLocation ?? !!id,
        BatchId: id ? hasBatchElement : !!id,
        BatchNo: id ? false : locationCached?.batchNo,
        ExpireDate: locationCached?.expireDate ?? !!id,
      };
    }
    if (measurementUnitsNumber === 2) {
      return {
        ...initialRenderCondition,
        Unit1Id: true,
        Quantity1: true,
        Unit2Id: true,
        Quantity2: true,
        InventoryLocationId: locationCached?.hasLocation ?? !!id,
        BatchId: id ? hasBatchElement : !!id,
        BatchNo: id ? false : locationCached?.batchNo,
        ExpireDate: locationCached?.expireDate ?? !!id,
      };
    }
    if (measurementUnitsNumber === 3) {
      return {
        ...initialRenderCondition,
        Unit1Id: true,
        Quantity1: true,
        Unit2Id: true,
        Quantity2: true,
        Unit3Id: true,
        Quantity3: true,
        InventoryLocationId: locationCached?.hasLocation ?? !!id,
        BatchId: id ? hasBatchElement : !!id,
        BatchNo: id ? false : locationCached?.batchNo,
        ExpireDate: locationCached?.expireDate ?? !!id,
      };
    }

    return {
      ...initialRenderCondition,
      InventoryLocationId: locationCached?.hasLocation ?? !!id,
      BatchId: id ? hasBatchElement : !!id,
      BatchNo: id ? false : locationCached?.batchNo,
      ExpireDate: locationCached?.expireDate ?? !!id,
    };
  };

  const defaultValue = id ? data?.Data && data?.Data[0] : null;

  useEffect(() => {
    let formData = [];
    if (defaultValue && defaultValue !== null) {
      setDetailsInitialData([]);
      const correctDefaultValue = {
        ...defaultValue,
      };
      formData = formConfig.map((item) => {
        const storedDataValue = storedData?.find(
          (i) => i.name === item.name
        )?.value;

        const correctValue = storedDataValue
          ? storedDataValue
          : correctDefaultValue[item.name];

        const storedDataOriginalValue = storedData?.find(
          (i) => i.name === item.name
        )?.originalValue;
        const correctOriginalValue = storedDataOriginalValue
          ? storedDataOriginalValue
          : correctDefaultValue[item.name];

        const newValue = {
          ...item,
          value: correctValue ?? item?.value,
          originalValue: correctOriginalValue ?? item?.originalValue,
          isTitleField: item.name === titleKey,
        };

        return newValue;
      });

      formData.push({
        name: fieldKey,
        caption: "MainIdField",
        value: id,
        originalValue: id,
        isTitleField: false,
        type: "",
      });
    } else {
      formData = formConfig.map((item) => ({
        ...item,
        isTitleField: item.name === titleKey,
        value: item?.value,
        originalValue: item?.originalValue,
      }));
    }

    if (defaultValue) {
      setHeaderId(defaultValue[fieldKey]);
    } else {
      setHeaderId(null);
    }

    if (vti) {
      formData = formData.map((i) =>
        i.name === "VoucherTypeId" ? { ...i, value: vti } : i
      );
    }
    dispatch(setAllPageData(formData));
    dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
  }, [defaultValue, pageId]);

  useEffect(() => {
    if (detailsData && detailsData?.Data?.length > 0) {
      const correctDetailData = detailsData?.Data?.map((item) => {
        const data = {
          ...item,
          Batch: {
            BatchId: item?.BatchId,
            BatchDesc: item?.Batch?.BachNumber,
            ...item.Batch,
          },
          ExpireDate: item?.Batch?.ExpireDate,
          key: item[alternateKey],
        };

        return data;
      });

      // if (match || pageNumber === 1) {
      //   setDetailsInitialData(correctDetailData);
      // } else {
      //   setDetailsInitialData((prevState) => [
      //     ...prevState,
      //     ...correctDetailData,
      //   ]);
      // }

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

  useEffect(() => {
    setColumnsConfig((prev) => [
      ...prev,
      {
        fieldName: "BatchId",
        fieldCaption: "بچ",
        fieldType: "selectOption",
        dynamicValue: {
          endpoint: "api/inv/select/batch4selectOptionByVoucherTypeId",
          voucherTypeId: voucherTypeId,
        },
        calcIndependent: true,
        conditionKey: "GoodsId",
        order: 9,
      },
    ]);
    if (!id) {
      setColumnsConfig((prev) => [
        ...prev,

        {
          fieldName: "ExpireDate",
          fieldCaption: "تاریخ انقضا",
          fieldType: "date",
          conditionKey: "GoodsId",
          order: 10,
        },
      ]);
    } else {
      setColumnsConfig((prev) => [
        ...prev,

        {
          fieldName: "ExpireDate",
          fieldCaption: "تاریخ انقضا",
          fieldType: "static",
          conditionKey: "GoodsId",
          staticConfig: {
            mode: "function",
            valueType: "date",
            config: (rowData) => {
              const correctDate = rowData?.["ExpireDate"]
                ? convertDate({
                    dateString: rowData?.["ExpireDate"],
                    locale: locale,
                  })
                : "-";

              return correctDate;
            },
            order: 10,
          },
        },
      ]);
    }
  }, [voucherTypeId]);

  const ReferId = Form.useWatch("ReferId", form);
  useEffect(() => {
    if (ReferId) {
      setColumnsConfig((prev) =>
        prev.map((i) =>
          i.fieldName === "GoodsId"
            ? {
                ...i,
                dynamicValue: {
                  endpoint: "/api/inv/select/voucher/goods4SelectOption",
                  VoucherHeaderId: ReferId,
                },
              }
            : i
        )
      );
      setDetailsInitialData([]);
    }
  }, [ReferId]);

  useEffect(() => {
    dispatch(
      setPageCaption({
        pageId: pageId,
        caption: "",
        captionII:  params.get("Caption"),
      })
    );
  }, []);

  return (
    <>
      {(!init?.Id || (defaultValue !== null && defaultValue)) && (
        <div className="flex flex-col gap-2">
          <InventoryVoucherHeaderForm form={form} />
          <div
            className={`${
              fullScreen
                ? "w-full"
                : `${
                    minimizePanel
                      ? "w-fit max-w-[calc(100dvw-300px)]"
                      : "w-fit max-w-[calc(100dvw-550px)]"
                  }`
            } hidden-show-scrollBar transition-all duration-200 h-[calc(100dvh-457px)] overflow-y-auto`}
          >
            <>
              {match ? (
                <DetailDataGrid.Desktop<IInventoryVoucherDetail>
                  isEdit={isEdit}
                  fieldKey={alternateKey}
                  alternateKey={alternateKey}
                  detailKey={detailKey}
                  detailCaption={detailCaption}
                  dragUrl={detailDragUrl}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnsConfig}
                  conditionRenderer={renderConditionalColumn}
                  currentPage={pageNumber}
                  contentHeight={555}
                />
              ) : (
                <DetailDataGrid.Mobile<IInventoryVoucherDetail>
                  isEdit={isEdit}
                  fieldKey={alternateKey}
                  alternateKey={alternateKey}
                  detailKey={detailKey}
                  detailCaption={detailCaption}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnsConfig}
                  conditionRenderer={renderConditionalColumn}
                  currentPage={pageNumber}
                  contentHeight={190}
                  isLoading={isLoading}
                  ref={childRef}
                  setPage={setPageNumber}
                  totalCount={detailsTotal?.TotalCount}
                />
              )}
            </>

            <div className="flex justify-end h-[32px]">
              {match &&
                detailsTotal?.TotalCount > recordsPerPage &&
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};
