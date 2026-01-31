"use client";
import { useEffect, useRef, useState } from "react";

import { Pagination } from "antd";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import {
  DownChevron,
  LeftChevron,
  RightChevron,
} from "@components/atoms/iconComponents";
import {
  MobileResult,
  VoucherForm,
  VoucherResult,
} from "@components/molecules/accounting";
import type { IChildHandle } from "@components/molecules/accounting/voucher/mobileGrid/type";
import { DetailDataGrid } from "@components/molecules/detailDataGrid";
import type { IAdditionalAction } from "@components/molecules/detailDataGrid/type";
import { useAppSelector } from "@redux/index";
import type { IAccount } from "@services/acc/account/type";
import type { IRequest, IVoucher } from "@services/acc/voucher/type";
import type { IVoucherDetails } from "@services/acc/voucherDetails/type";
import { useGetData } from "@services/base";
import {
  type IDetailColumnConfig,
  RowStateEnum,
} from "@services/generalType/type";
import { setAllPageData, setPageData, setPageInfo } from "@slice/pages";
import { hasStoredValue } from "@utils/core";

import { formConfig } from "./config";
import type { IVoucherTotal } from "./type";

function findStandaloneAccounts(accounts: IAccount[]): IAccount[] {
  const standaloneAccounts: IAccount[] = [];

  for (const account of accounts) {
    if (!account.Accounts || account.Accounts.length === 0) {
      standaloneAccounts.push(account);
    } else {
      standaloneAccounts.push(...findStandaloneAccounts(account.Accounts));
    }
  }

  return standaloneAccounts;
}

export const Voucher = ({ setMobileDrawerContent, form }) => {
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

  const dispatch = useDispatch();
  const params = useSearchParams();
  const t = useTranslations();
  const id = Number(params.get("id"));
  const isEdit = id ? true : false;
  const titleKey = "VoucherNumber";
  const fieldKey = "VoucherHeaderId";
  const repoViewId = 10011;
  const detailsRepoViewId = 10011;
  const getUrl = "/api/acc/select/voucher";
  const getDetailUrl = "/api/acc/select/voucherDetail";
  const createUrl = "/api/acc/insert/voucher";
  const updateUrl = "/api/acc/update/voucher";
  const deleteUrl = "api/acc/delete/voucher";
  const detailDragUrl = "api/acc/changeRowNumber/voucherDetail";
  const alternateKey = "VoucherDetailId";
  const detailCaption = "اقلام سند";
  const detailKey = "Details";

  const storedData = activePage?.pageData;

  const detailInitial = activePage?.pageData?.find(
    (item) => item.name === "Details"
  )?.value;

  const [standaloneAccounts, setStandaloneAccounts] = useState<IAccount[]>([]);
  const [isShowForm, setShowForm] = useState(true);
  const [voucherTotal, setVoucherTotal] = useState<IVoucherTotal>({
    debit: 0,
    credit: 0,
    balance: 0,
  });
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

  const { data: accountTree } = useGetData<IAccount[], IRequest>({
    url: "/api/acc/select/account",
    body: {
      RepoViewId: 10001,
    },
  });

  const handlePaginationChange = (page: number) => {
    setPageNumber(page);
  };

  const pageId = activePage?.pageId;
  const info = {
    addEndpoint: createUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };

  const { data } = useGetData<IVoucher[], IRequest>({
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
    IVoucherDetails[],
    IRequest
  >({
    url: getDetailUrl,
    body: {
      RepoViewId: detailsRepoViewId,
      HeaderId: Number(id),
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
      HeaderId: Number(id),
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

  const calculateParameter = (detailsData: IVoucherDetails[]) => {
    const calculateTotals = (realDetailData: IVoucherDetails[]) => {
      return realDetailData.reduce(
        (acc, item) => {
          acc.totalDebit += Number(item.Bes) || 0;
          acc.totalCredit += Number(item.Bed) || 0;
          return acc;
        },
        { totalDebit: 0, totalCredit: 0 }
      );
    };

    const { totalDebit, totalCredit } = calculateTotals(detailsData);
    const balance = totalCredit - totalDebit;

    setVoucherTotal({
      balance: balance,
      credit: totalCredit,
      debit: totalDebit,
    });

    return {
      balance: balance,
      credit: totalCredit,
      debit: totalDebit,
    };
  };

  const additionalAction: IAdditionalAction<IVoucherDetails>[] = [
    {
      label: t("general.adjustToZeroBalance"),
      shortcutKey: "Ctrl + S",
      handler: ({ record, index, helpers }) => {
        const { dispatchDetailData } = helpers;

        if (record?.RowState !== RowStateEnum.Delete) {
          let bes = 0;
          let bed = 0;
          const nowBed = record?.Bed || 0;
          const nowBes = record?.Bes || 0;
          const correctBalance = voucherTotal.balance - nowBed + nowBes;

          if (correctBalance < 0) {
            bed = Math.abs(correctBalance);
          } else {
            bes = Math.abs(correctBalance);
          }

          const updatedRow = {
            index,
            data: {
              Bed: bed,
              Bes: bes,
            },
          };

          dispatchDetailData({
            type: "UPDATE_ROW",
            payload: updatedRow,
          });
        }
      },
    },
    {
      label: t("general.duplicateFromUpperRow"),
      shortcutKey: "Ctrl + D",

      handler: ({ record, index, helpers, field }) => {
        const { detailData, dispatchDetailData } = helpers;

        const targetValue = detailData[index - 1];

        if (
          targetValue.RowState !== RowStateEnum.Delete &&
          targetValue &&
          targetValue[field]
        ) {
          const updatedRow = {
            index,
            data: {
              [field]: targetValue[field],
            },
          };

          dispatchDetailData({
            type: "UPDATE_ROW",
            payload: updatedRow,
          });
        }
      },
    },
    {
      label: t("general.swapDebtorCreditor"),
      shortcutKey: "Ctrl + R",
      handler: ({ record, index, helpers }) => {
        const { dispatchDetailData } = helpers;

        if (record?.RowState !== RowStateEnum.Delete) {
          const oldBed = record.Bed;
          const oldBes = record.Bes;

          const updatedRow = {
            index,
            data: {
              Bed: oldBes,
              Bes: oldBed,
            },
          };

          dispatchDetailData({
            type: "UPDATE_ROW",
            payload: updatedRow,
          });
        }
      },
    },
  ];

  const renderConditionalColumn = (
    conditionalValue: number,
    fieldName: string,
    initialRenderCondition: Record<string, boolean>
  ) => {
    if (conditionalValue) {
      const account = standaloneAccounts.find(
        (item) => item.AccountId === conditionalValue
      );

      return {
        ...initialRenderCondition,
        TafsiliId: true,
        FifthId: account?.HasFifth ? true : false,
        SixthId: account?.HasSixth ? true : false,
        SeventhId: account?.HasSeventh ? true : false,
        EightId: account?.HasEight ? true : false,
        NineId: account?.HasNine ? true : false,
        TenId: account?.HasTen ? true : false,
        ElevenId: account?.HasEleven ? true : false,
        TwelveId: account?.HasTwelve ? true : false,
        ThirteenId: account?.HasThirteen ? true : false,
        CurrencyId: account?.IsCurrency ? true : false,
        CurrencyNumber: account?.IsCurrency ? true : false,
        CurrencyRate: account?.IsCurrency ? true : false,
        FollowUpDate: account?.IsFollow ? true : false,
        FollowUpNumber: account?.IsFollow ? true : false,
        Count: account?.IsNumber ? true : false,
        ReferNumber: account?.IsRefer ? true : false,
        InsuranceNumber: account?.IsInsurance ? true : false,
      };
    }
  };

  const calcIndependentValue = async (
    rowData: IVoucherDetails,
    fieldName: string,
    newValue: any
  ) => {
    if (fieldName === "Bed") {
      return {
        ...rowData,
        [fieldName]: newValue,
        Bes: 0,
      };
    }
    if (fieldName === "Bes") {
      return {
        ...rowData,
        [fieldName]: newValue,
        Bed: 0,
      };
    }
    return {
      ...rowData,
      [fieldName]: newValue,
    };
  };

  const columnConfig: IDetailColumnConfig[] = [
    {
      fieldName: "index",
      fieldCaption: `${t("general.row")} - ${t("general.action")}`,
      fieldType: "index",
      order: 1,
    },

    {
      fieldName: "AccountId",
      fieldCaption: t("general.accountTitle"),
      mobileRender: true,
      dynamicValue: {
        endpoint: "/api/acc/select/account4selectOption",
        repoViewId: 10018,
        Level: 3,
        OrderInfo: [
          {
            Asc: true,
            ColName: "AccountId",
          },
        ],
      },
      fieldType: "selectOption",
      showIdInDesc: false,
      order: 2,
      width: 200,
    },

    {
      fieldName: "CurrencyId",
      fieldCaption: t("general.currencyType"),
      conditionKey: "AccountId",
      fieldType: "selectOption",
      dynamicValue: {
        endpoint: "/api/acc/select/availableCurrencies4SelectOption",
        repoViewId: null,
      },
      order: 3,
      width: 150,
    },
    {
      fieldName: "CurrencyNumber",
      conditionKey: "AccountId",
      fieldCaption: t("general.currencyCount"),
      fieldType: "number",
      order: 4,
    },
    {
      fieldName: "CurrencyRate",
      conditionKey: "AccountId",
      fieldCaption: t("general.currencyRate"),
      fieldType: "price",
      order: 5,
    },
    {
      fieldName: "FollowUpDate",
      conditionKey: "AccountId",
      fieldCaption: t("general.followUpDate"),
      fieldType: "date",
      order: 6,
    },
    {
      fieldName: "FollowUpNumber",
      conditionKey: "AccountId",
      fieldCaption: t("general.followUpNumber"),
      fieldType: "text",
      order: 7,
    },
    {
      fieldName: "Count",
      conditionKey: "AccountId",
      fieldCaption: t("general.countNumber"),
      fieldType: "number",
      order: 8,
    },
    {
      fieldName: "ReferNumber",
      conditionKey: "AccountId",
      fieldCaption: t("general.referNumber"),
      fieldType: "text",
      order: 9,
    },
    {
      fieldName: "InsuranceNumber",
      conditionKey: "AccountId",
      fieldCaption: t("general.insuranceNumber"),
      fieldType: "text",
      order: 10,
    },
    {
      fieldName: "TafsiliId",
      conditionKey: "AccountId",
      fieldCaption: t("general.tafsili"),
      fieldType: "selectOption",
      order: 11,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel4",
        repoViewId: 10017,
      },
      width: 160,
    },

    {
      fieldName: "FifthId",
      conditionKey: "AccountId",
      fieldCaption: t("general.level5"),
      fieldType: "selectOption",
      order: 12,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel5",
        repoViewId: 10017,
      },
      width: 160,
    },
    {
      fieldName: "SixthId",
      conditionKey: "AccountId",
      fieldCaption: t("general.level6"),
      fieldType: "selectOption",
      order: 13,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel6",
        repoViewId: 10017,
      },
      width: 160,
    },
    {
      fieldName: "SeventhId",
      conditionKey: "AccountId",
      fieldCaption: t("general.level7"),
      fieldType: "selectOption",
      order: 14,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel7",
        repoViewId: 10017,
      },
      width: 160,
    },
    {
      fieldName: "EightId",
      conditionKey: "AccountId",
      fieldCaption: t("general.level8"),
      fieldType: "selectOption",
      order: 15,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel8",
        repoViewId: 10017,
      },
      width: 160,
    },
    {
      fieldName: "NineId",
      conditionKey: "AccountId",
      fieldCaption: t("general.level9"),
      fieldType: "selectOption",
      order: 16,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel9",
        repoViewId: 10017,
      },
      width: 160,
    },
    {
      fieldName: "TenId",
      conditionKey: "AccountId",
      fieldCaption: t("general.level10"),
      fieldType: "selectOption",
      order: 17,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel10",
        repoViewId: 10017,
      },
      width: 160,
    },
    {
      fieldName: "ElevenId",
      conditionKey: "AccountId",
      fieldCaption: t("general.level11"),
      fieldType: "selectOption",
      order: 18,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel11",
        repoViewId: 10017,
      },
      width: 160,
    },
    {
      fieldName: "TwelveId",
      conditionKey: "AccountId",
      fieldCaption: t("general.level12"),
      fieldType: "selectOption",
      order: 19,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel12",
        repoViewId: 10017,
      },
      width: 160,
    },
    {
      fieldName: "ThirteenId",
      conditionKey: "AccountId",
      fieldCaption: t("general.level13"),
      fieldType: "selectOption",
      order: 20,
      dynamicValue: {
        endpoint: "/api/acc/select/tafsiliLevel13",
        repoViewId: 10017,
      },
      width: 160,
    },

    {
      fieldName: "DetailDesc",
      fieldCaption: t("general.rowDescription"),
      fieldType: "text",
      mobileRender: true,
      order: 21,
    },
    {
      fieldName: "Bes",
      fieldCaption: t("general.debit"),
      fieldType: "price",
      mobileRender: true,
      calcIndependent: true,
      independentValue: true,
      order: 22,
    },
    {
      fieldName: "Bed",
      fieldCaption: t("general.credit"),
      fieldType: "price",
      mobileRender: true,
      calcIndependent: true,
      independentValue: true,
      order: 23,
    },
  ];

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

    const eInvoiceFieldConfig = formConfig.find(
      (f) => f.name === "eInvoicePatternTypeOne"
    );
    if (eInvoiceFieldConfig && Array.isArray(formData)) {
      const filtered = formData.filter(
        (fd) =>
          fd.name !== "eInvoicePatternTypeTwo" &&
          fd.name !== "eInvoicePatternTypeOne"
      );

      formData = [
        ...filtered,
        {
          name: eInvoiceFieldConfig.name,
          caption: eInvoiceFieldConfig.caption,
          type: eInvoiceFieldConfig.type,
          originalValue: eInvoiceFieldConfig.originalValue,
          value: eInvoiceFieldConfig.value,
        },
      ];
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
          Tafsili: { desc: item?.Levels.find((el) => el.Level === 4)?.desc },
          Fifth: { desc: item?.Levels.find((el) => el.Level === 5)?.desc },
          Sixth: { desc: item?.Levels.find((el) => el.Level === 6)?.desc },
          Seventh: { desc: item?.Levels.find((el) => el.Level === 7)?.desc },
          Eight: { desc: item?.Levels.find((el) => el.Level === 8)?.desc },
          Nine: { desc: item?.Levels.find((el) => el.Level === 9)?.desc },
          Ten: { desc: item?.Levels.find((el) => el.Level === 10)?.desc },
          Eleven: { desc: item?.Levels.find((el) => el.Level === 11)?.desc },
          Twelve: { desc: item?.Levels.find((el) => el.Level === 12)?.desc },
          Thirteen: { desc: item?.Levels.find((el) => el.Level === 13)?.desc },
          ...item,
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
    setMobileDrawerContent(
      <MobileResult
        balance={voucherTotal.balance}
        totalCredit={voucherTotal.credit}
        totalDebit={voucherTotal.debit}
      />
    );
  }, [voucherTotal]);

  useEffect(() => {
    if (accountTree?.Data && accountTree?.Data?.length > 0) {
      const items = findStandaloneAccounts(accountTree?.Data);
      setStandaloneAccounts(items);
    }
  }, [accountTree?.Data]);

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
          {isShowForm && <VoucherForm form={form} />}
        </div>

        <div className="flex flex-col gap-2 col-span-2 pt-2">
          <div className="flex items-center gap-2">
            <div
              className={`${isShowForm ? "rotate-180" : ""} `}
              onClick={() => !match && setShowForm(!isShowForm)}
            >
              <DownChevron />
            </div>

            <div className="flex justify-between items-center w-full">
              <div className="text-sm">
                <span>{t("general.voucherDetail")} </span>
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
                    className="!bg-black-black8 hover:bg-black-black8 focus-within:bg-black-black8 focus:bg-black-black8 active:bg-black-black8 px-3 py-1 border rounded !text-white text-xs"
                    onClick={handleAddNew}
                  >
                    {t("general.add")}
                  </CustomButton>
                </>
              )}
            </div>
          </div>
          {standaloneAccounts.length > 0 && (
            <div
              className={`${
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
                !match ? "h-full" : "h-[calc(100dvh-425px)]"
              }   flex hidden-show-scrollBar transition-all duration-200 flex-col justify-between gap-2`}
            >
              {match ? (
                <DetailDataGrid.Desktop<IVoucherDetails>
                  isEdit={isEdit}
                  fieldKey={alternateKey}
                  alternateKey={alternateKey}
                  detailKey={detailKey}
                  detailCaption={detailCaption}
                  dragUrl={detailDragUrl}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnConfig}
                  conditionRenderer={renderConditionalColumn}
                  currentPage={pageNumber}
                  contentHeight={425}
                  additionalActions={additionalAction}
                  additionalFunction={calculateParameter}
                  calcIndependentValue={calcIndependentValue}
                />
              ) : (
                <DetailDataGrid.Mobile<IVoucherDetails>
                  isEdit={isEdit}
                  fieldKey={alternateKey}
                  alternateKey={alternateKey}
                  detailKey={detailKey}
                  detailCaption={detailCaption}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnConfig}
                  conditionRenderer={renderConditionalColumn}
                  currentPage={pageNumber}
                  contentHeight={190}
                  isLoading={isFetching}
                  ref={childRef}
                  setPage={setPageNumber}
                  setShowForm={setShowForm}
                  totalCount={detailsTotal?.TotalCount}
                  additionalActions={additionalAction}
                  additionalFunction={calculateParameter}
                  calcIndependentValue={calcIndependentValue}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className={`${
          match ? "flex justify-between items-end" : "flex flex-col gap-2"
        } `}
      >
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
          <VoucherResult
            balance={voucherTotal.balance}
            totalCredit={voucherTotal.credit}
            totalDebit={voucherTotal.debit}
          />
        )}
      </div>
    </div>
  );
};
