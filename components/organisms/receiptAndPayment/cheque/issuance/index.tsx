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
  IssuanceChequeForm,
} from '@components/molecules/receiptAndPayment/cheque';
import { useAppSelector } from '@redux/index';
import { useGetData } from '@services/base';
import type { IDetailColumnConfig } from '@services/generalType/type';
import type {
  IChequeIssuance,
  IRequest,
} from '@services/trh/chequeIssuance/type';
import type {
  IChequeIssuanceDetail,
} from '@services/trh/chequeIssuanceDetail/type';
import {
  setAllPageData,
  setPageInfo,
} from '@slice/pages';

import { formConfig } from './config';

export const ChequeIssuance = ({ form }) => {
  const titleKey = "VoucherNumber";
  const fieldKey = "CheckIssuanceHeaderId";
  const alternateKey = "CheckIssuanceDetailId";
  const detailCaption = "اقلام";
  const detailKey = "Details";
  const repoViewId = 3023;
  const detailRepoViewId = 3022;
  const detailDragUrl = "";
  const getUrl = "api/trh/select/check/issuance";
  const getDetailUrl = "api/trh/select/checkDetail/issuance";
  const addUrl = "api/trh/insert/check/issuance";
  const updateUrl = "api/trh/update/check/issuance";
  const deleteUrl = "api/trh/delete/check/issuance";

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
      activePage: state.withPersist.pages.find(
        (item) => item.isActive === true
      ),
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
  const [headerId, setHeaderId] = useState(null);
  const [isShowForm, setShowForm] = useState(true);
  const [bankAccountId, setBankAccountId] = useState(null);
  const [columnConfig, setColumnConfig] = useState([]);
  const [detailsInitialData, setDetailsInitialData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);

  const { data } = useGetData<IChequeIssuance[], IRequest>({
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

  const recordsPerPage = !match
    ? mobileRecordsPerPage
    : Math.floor((deviceHeight - formHeight) / recordHeight);

  const { data: detailsData, isFetching: isLoading } = useGetData<
    IChequeIssuanceDetail[],
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
    id: id,
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
    if (!id || defaultValue !== null) {
      let formData = [];

      if (defaultValue !== null && defaultValue) {
        formData = formConfig.map((item) => {
          const storedDataValue = storedData?.find(
            (i) => i.name === item.name
          )?.value;

          const correctValue = storedDataValue
            ? storedDataValue
            : defaultValue[item.name];
          const newValue = {
            ...item,
            value: correctValue ?? item.value,
            originalValue: defaultValue[item.name] ?? item.originalValue,
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
          value: item.value,
          originalValue: item.originalValue,
        }));
      }

      if (defaultValue) {
        setHeaderId(defaultValue[fieldKey]);
      }

      dispatch(setAllPageData(formData));
      dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
    }
  }, [defaultValue]);

  useEffect(() => {
    if (detailsData && detailsData?.Data?.length > 0) {
      if (match || pageNumber === 1) {
        setDetailsInitialData(detailsData?.Data);
      } else {
        setDetailsInitialData((prevState) => [
          ...prevState,
          ...detailsData.Data,
        ]);
      }
    }
  }, [detailsData?.Data, headerId]);

  useEffect(() => {
    const bankAccount = activePage?.pageData?.find(
      (i) => i.name === "BankAccountId"
    );
    if (bankAccount) {
      setBankAccountId(bankAccount.value);
    }
  }, [activePage?.pageData]);

  useEffect(() => {
    if (bankAccountId) {
      const config: IDetailColumnConfig[] = [
        {
          fieldName: "index",
          fieldCaption: `ردیف - عملیات`,
          fieldType: "index",
          order: 1,
        },
        {
          fieldName: "CheckPlaceMentDetailId",
          fieldCaption: "چک",
          fieldType: "selectOption",
          dynamicValue: {
            addWebUrl: "api/trh/select/CheckPlacementDetail/Check/Issuance",
            endpoint: "api/trh/select/CheckPlacementDetail/Check/Issuance",
            repoViewId: 140029,
            BankAccountId: bankAccountId,
          },
          mobileRender: true,
          order: 2,
        },
        {
          fieldName: "MaturityDate",
          fieldCaption: "تاریخ سررسید",
          fieldType: "date",
          mobileRender: true,
          order: 3,
        },
        {
          fieldName: "DocPrice",
          fieldCaption: "مبلغ",
          fieldType: "price",
          mobileRender: true,
          order: 4,
        },
        {
          fieldName: "IsForToday",
          fieldCaption: "چک روز",
          fieldType: "boolean",
          mobileRender: true,
          order: 5,
        },
        {
          fieldName: "DetailDesc",
          fieldCaption: "شرح",
          fieldType: "text",
          order: 6,
        },
      ];
      setColumnConfig(config);
    }
  }, [bankAccountId]);

  return (
    <>
      {(!id || (defaultValue !== null && defaultValue)) && (
        <div className="flex flex-col gap-1">
          <div
            className={`${
              isShowForm
                ? "opacity-100 transform translate-y-1"
                : "opacity-0 transform translate-y-0 pointer-events-none"
            }  transition-all duration-500 ease-in-out pb-2 `}
          >
            {isShowForm && (
              <IssuanceChequeForm activePage={activePage} form={form} />
            )}
          </div>
          {bankAccountId && (
            <div className="flex items-center gap-2 pt-8">
              <div
                className={`${isShowForm ? "rotate-180" : ""} `}
                onClick={() => !match && setShowForm(!isShowForm)}
              >
                <DownChevron />
              </div>

              <div className="flex justify-between items-center w-full">
                <div className="text-sm">
                  <span>{detailCaption} </span>
                  {!match && detailsTotal?.TotalCount && (
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
          )}

          <div
            className={`${
              fullScreen
                ? "w-full"
                : !match
                ? "w-full"
                : `${
                    minimizePanel
                      ? "w-fit max-w-[calc(100dvw-300px)]"
                      : "w-fit max-w-[calc(100dvw-550px)]"
                  }`
            } ${
              !match ? "h-full" : "h-[calc(100dvh-430px)]"
            } flex hidden-show-scrollBar transition-all duration-200 flex-col justify-between gap-2`}
          >
            {!bankAccountId && (
              <span className="mt-4 font-bold text-sm">
                انتخاب بانک الزامی است!
              </span>
            )}
            {bankAccountId &&
              columnConfig &&
              (match ? (
                <DetailDataGrid.Desktop<IChequeIssuanceDetail>
                  isEdit={isEdit}
                  fieldKey={alternateKey}
                  alternateKey={alternateKey}
                  detailKey={detailKey}
                  detailCaption={detailCaption}
                  dragUrl={detailDragUrl}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnConfig}
                  currentPage={pageNumber}
                  contentHeight={430}
                />
              ) : (
                <DetailDataGrid.Mobile<IChequeIssuanceDetail>
                  isEdit={isEdit}
                  fieldKey={alternateKey}
                  alternateKey={alternateKey}
                  detailKey={detailKey}
                  detailCaption={detailCaption}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnConfig}
                  currentPage={pageNumber}
                  contentHeight={190}
                  isLoading={isLoading}
                  ref={childRef}
                  setPage={setPageNumber}
                  setShowForm={setShowForm}
                  totalCount={detailsTotal?.TotalCount}
                />
              ))}
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
      )}
    </>
  );
};
