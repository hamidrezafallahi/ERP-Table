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
  DownChevron,
  LeftChevron,
  RightChevron,
} from '@components/atoms/iconComponents';
import { DetailDataGrid } from '@components/molecules/detailDataGrid';
import type {
  IChildHandle,
} from '@components/molecules/detailDataGrid/mobile/type';
import {
  ReturnSalesInvoiceForm,
} from '@components/molecules/salesAndPurchase/salesInvoice';
import { useAppSelector } from '@redux/index';
import { useGetData } from '@services/base';
import type {
  IRequest,
  IReturnSalesInvoice,
} from '@services/sale/returnSalesInvoice/type';
import type {
  ISalesInvoiceDetails,
} from '@services/sale/salesInvoiceDetails/type';
import {
  setAllPageData,
  setPageData,
  setPageInfo,
} from '@slice/pages';
import { hasStoredValue } from '@utils/core';

import {
  columnConfig,
  formConfig,
} from './config';

export const ReturnSalesInvoice = ({ form }) => {
  const titleKey = "VoucherNumber";
  const fieldKey = "SalesReturnHeaderId";
  const alternateKey = "SalesReturnDetailId";
  const detailCaption = "اقلام فاکتور";
  const detailKey = "Details";
  const repoViewId = 130009;
  const detailRepoViewId = 130010;
  const detailDragUrl = "";
  const getUrl = "/api/sale/select/invoiceReturn";
  const getDetailUrl = "/api/sale/select/invoiceReturn/detail";
  const addUrl = "api/sale/insert/invoiceReturn";
  const updateUrl = "api/sale/update/invoiceReturn";
  const deleteUrl = "api/sale/delete/invoiceReturn";

  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const formHeight = 580;
  const mobileRecordsPerPage = 10;

  const t = useTranslations();
  const dispatch = useDispatch();
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const isEdit = id ? true : false;

  const { activePage, fullScreen, minimizePanel, match } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
      fullScreen: state.withPersist.config.fullScreen,
      minimizePanel: state.withoutPersist.container.minimize,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );

  const storedData = activePage?.pageData;
  const pageId = activePage?.pageId;
  const info = {
    addEndpoint: addUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };

  const detailRequiredKey = "InvoiceHeaderId";
  const detailRequiredValue = activePage?.pageData?.find(
    (item) => item.name === detailRequiredKey
  );

  const detailInitial = activePage?.pageData?.find(
    (item) => item.name === detailKey
  )?.value;

  const [headerId, setHeaderId] = useState(null);
  const [isShowForm, setShowForm] = useState(true);
  const [detailsInitialData, setDetailsInitialData] = useState([]);
  const [columnsConfig, setColumnsConfig] = useState(columnConfig);
  const [pageNumber, setPageNumber] = useState(1);

  const { data } = useGetData<IReturnSalesInvoice[], IRequest>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      Id: id,
      ShowBookmarked: true,
      ShowTags: true,
    },
    skip: !id,
    // id: id,
  });

  const recordsPerPage = !match
    ? mobileRecordsPerPage
    : Math.floor((deviceHeight - formHeight) / recordHeight);

  const { data: detailsData, isFetching: isLoading } = useGetData<
    ISalesInvoiceDetails[],
    IRequest
  >({
    url: getDetailUrl,
    body: {
      RepoViewId: detailRepoViewId,
      HeaderId: headerId,
      ShowBookmarked: true,
      ShowTags: true,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordsPerPage,
      },
    },
    skip: !headerId,
    // id: id,
  });

  const { data: detailsTotal } = useGetData<null, null>({
    url: getDetailUrl,
    body: {
      RepoViewId: detailRepoViewId,
      HeaderId: Number(headerId),
      ShowBookmarked: true,
      ShowTags: true,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordsPerPage,
        OnlyTotalCount: true,
      },
    },
    skip: !id || !headerId,
    id: id,
  });

  const childRef = useRef<IChildHandle>(null);

  const handleAddNew = () => {
    const index = 0;
    if (childRef.current) {
      childRef.current.mobileHandleAdd(index);
    }
  };
  const handlePaginationChange = (page: number) => {
    setPageNumber(page);
  };

  const defaultValue = id ? data?.Data && data?.Data[0] : null;

  useEffect(() => {
    if (detailRequiredValue?.value) {
      setColumnsConfig([
        ...columnConfig,
        {
          fieldName: "GoodsId",
          fieldCaption: "کالا",
          mobileRender: true,
          fieldType: "selectOption",
          calcIndependent: true,
          dynamicValue: {
            endpoint: "api/sale/select/invoiceReturn/goods",
            // repoViewId: 1070,
            InvoiceHeaderId: detailRequiredValue?.value,
          },
          order: 2,
          width: 250,
        },
      ]);

      dispatch(
        setPageData({
          name: detailKey,
          value: [],
          originalValue: [],
        })
      );
    }
  }, [detailRequiredValue?.value]);

  useEffect(() => {
    if (id && detailsData && detailsData?.Data?.length > 0) {
      const correctDetailData = detailsData?.Data?.map((item) => {
        const data = {
          ...item,
          key: item[alternateKey],
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
    }
  }, [detailsData?.Data, pageId]);

  useEffect(() => {
    const hasStored = Array.isArray(storedData) && storedData.length > 0;

    let formData;

    if (defaultValue !== null && defaultValue) {
      const correctDefaultValue = {
        ...defaultValue,
        InvoiceHeaderId: defaultValue?.InvoiceHeader?.InvoiceHeaderId,
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

    if (defaultValue) {
      setHeaderId(defaultValue[fieldKey]);
    } else if (hasStored) {
      const headerEntry = storedData.find((i) => i.name === fieldKey);
      setHeaderId(headerEntry?.value ?? null);
    } else {
      setHeaderId(null);
    }

    const shouldDispatch =
      !hasStored || JSON.stringify(formData) !== JSON.stringify(storedData);
    if (shouldDispatch) {
      dispatch(setAllPageData(formData));
    }

    dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
  }, [defaultValue, pageId, storedData]);

  return (
    <>
      {(!id || (defaultValue !== null && defaultValue)) && (
        <div
          className={`${
            !match ? "h-full" : "!h-[calc(100dvh-160px)]"
          } flex flex-col justify-between gap-1`}
        >
          <div
            className={`${
              isShowForm
                ? "opacity-100 transform translate-y-1"
                : "opacity-0 transform translate-y-0 pointer-events-none"
            }  transition-all duration-500 ease-in-out pb-2 `}
          >
            {isShowForm && (
              <>
                <ReturnSalesInvoiceForm form={form} />
              </>
            )}
          </div>

          <div className={detailRequiredValue?.value ? "" : "relative"}>
            {!detailRequiredValue?.value && (
              <div className="z-50 absolute inset-0 flex justify-center items-start backdrop-blur-sm pt-32 rounded font-bold text-sm">
                {t("general.salesInvoiceRequired")}
              </div>
            )}
            <div className="flex items-center gap-2 pt-10">
              <div
                className={`${isShowForm ? "rotate-180" : ""} `}
                onClick={() => !match && setShowForm(!isShowForm)}
              >
                <DownChevron />
              </div>

              <div className="flex justify-between items-center w-full">
                <div className="text-sm">
                  <span>{detailCaption} </span>
                  {!match && (
                    <span>
                      ( {detailsTotal?.TotalCount} {t("general.item")} )
                    </span>
                  )}
                </div>
                {!match && (
                  <>
                    <CustomButton
                      type="text"
                      className="!bg-black-black8 hover:bg-black-black8 focus-within:bg-black-black8 focus:bg-black-black8 active:bg-black-black8 my-2 px-3 py-1 border rounded !text-white text-xs"
                      onClick={handleAddNew}
                    >
                      {t("general.add")}
                    </CustomButton>
                  </>
                )}
              </div>
            </div>

            <div
              className={`${
                fullScreen
                  ? "w-full"
                  : !match
                  ? "w-full"
                  : `${
                      minimizePanel
                        ? "w-fit max-w-[calc(100dvw-350px)]"
                        : "w-fit max-w-[calc(100dvw-560px)]"
                    }`
              } ${
                !match ? "h-full" : "h-[calc(100dvh-400px)]"
              }   flex hidden-show-scrollBar transition-all duration-200 flex-col justify-between gap-2`}
            >
              {match ? (
                <DetailDataGrid.Desktop<ISalesInvoiceDetails>
                  isEdit={isEdit}
                  fieldKey={alternateKey}
                  alternateKey={alternateKey}
                  detailKey={detailKey}
                  detailCaption={detailCaption}
                  dragUrl={detailDragUrl}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnsConfig}
                  conditionRenderer={(
                    conditionalValue: number,
                    fieldName: string,
                    initialRenderCondition: Record<string, boolean>
                  ) => {
                    if (conditionalValue) {
                      return {
                        ...initialRenderCondition,
                        UnitId: true,
                        Quantity: true,
                      };
                    }
                  }}
                  currentPage={pageNumber}
                  contentHeight={360}
                  // additionalActions={additionalAction}
                  // calcIndependentValue={calcIndependentValue}
                />
              ) : (
                <DetailDataGrid.Mobile<ISalesInvoiceDetails>
                  isEdit={isEdit}
                  fieldKey={alternateKey}
                  alternateKey={alternateKey}
                  detailKey={detailKey}
                  detailCaption={detailCaption}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnsConfig}
                  // conditionRenderer={renderConditionalColumn}
                  currentPage={pageNumber}
                  contentHeight={190}
                  isLoading={isLoading}
                  ref={childRef}
                  setPage={setPageNumber}
                  setShowForm={setShowForm}
                  totalCount={detailsTotal?.TotalCount}
                  // additionalActions={additionalAction}
                  // calcIndependentValue={calcIndependentValue}
                />
              )}
            </div>

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
