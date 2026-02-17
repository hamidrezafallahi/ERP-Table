"use client";
import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { DownChevron } from "@components/atoms/iconComponents";
import { DetailDataGrid } from "@components/molecules/detailDataGrid";
import { IChildHandle } from "@components/molecules/detailDataGrid/mobile/type";
import { WithdrawalTab } from "@components/molecules/receiptAndPayment";
import { AdvancedBankWithdrawalForm } from "@components/molecules/receiptAndPayment/bank";
import type { IActiveTab } from "@components/molecules/receiptAndPayment/type";
import { useAppSelector } from "@redux/index";
import type { IAccount } from "@services/acc/account/type";
import { useGetData } from "@services/base";
import type {
  IBankWithdrawal,
  IRequest,
} from "@services/trh/bankWithdrawal/type";
import type { IRpWay } from "@services/trh/rpWay/type";
import { setAllPageData, setPageInfo } from "@slice/pages";
import { findItemInNestedData } from "@utils/core";

import { columnConfig, formConfig } from "./config";

export const AdvancedCashFundWithdrawal = ({ form }) => {
  const titleKey = "VoucherNumber";
  const baseFieldKey = "TankhahStatementId";
  const repoViewId = 3017;
  const getUrl = "api/trh/select/tankhahStatement/withdrawal";
  const addUrl = "api/trh/tankhahStatement/advanced/Withdrawal";
  const updateUrl = "api/trh/update/tankhahStatement/advanced/withdrawal";
  const deleteUrl = "";
  const detailDragUrl = "";

  const t = useTranslations();
  const dispatch = useDispatch();
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const isEdit = id ? true : false;

  const { activePage, fullScreen, minimizePanel, match } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find(
        (item) => item.isActive === true,
      ),
      fullScreen: state.withPersist.config.fullScreen,
      minimizePanel: state.withoutPersist.container.minimize,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  const storedData = activePage?.pageData;
  const pageId = activePage?.pageId;
  const info = {
    addEndpoint: addUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: baseFieldKey,
  };

  const [isShowForm, setShowForm] = useState(true);
  const [detailsInitialData, setDetailsInitialData] = useState([]);

  const [active, setActive] = useState<IActiveTab>({
    key: "صندوق",
    value: 1,
    fieldKey: "CashStatementId",
    detailKey: "CashStatements",
    detailCaption: "صندوق",
  });
  const [columnsConfig, setColumnsConfig] = useState([]);

  const { data } = useGetData<IBankWithdrawal[], IRequest>({
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

  const { data: rpWayData } = useGetData<IRpWay[], IRequest>({
    url: "api/trh/select/rpWay4voucher",
    body: {},
  });

  const { data: accountTree } = useGetData<IAccount[], IRequest>({
    url: "/api/acc/select/account",
    body: {
      RepoViewId: 10001,
    },
  });

  const childRef = useRef<IChildHandle>(null);

  const handleAddNew = () => {
    const index = 0;
    if (childRef.current) {
      childRef.current.mobileHandleAdd(index);
    }
  };

  const renderConditionalColumn = (
    conditionValue: number,
    fieldName: string,
    initialRenderCondition: Record<string, boolean>,
  ) => {
    if (conditionValue) {
      let accountId = null;
      const newAccountId = rpWayData?.Data?.find(
        (item) => item._SelectId === conditionValue,
      )?.AccountId;
      if (newAccountId) {
        accountId = newAccountId;
      } else {
        accountId = null;
      }

      const condition = findItemInNestedData<IAccount>(
        accountTree?.Data,
        "AccountId",
        accountId,
      );

      return {
        ...initialRenderCondition,
        TafsiliId: condition?.HasTafsili ? true : false,
        FifthId: condition?.HasFifth ? true : false,
        SixthId: condition?.HasSixth ? true : false,
        SeventhId: condition?.HasSeventh ? true : false,
        EightId: condition?.HasEight ? true : false,
        NineId: condition?.HasNine ? true : false,
        TenId: condition?.HasTen ? true : false,
        ElevenId: condition?.HasEleven ? true : false,
        TwelveId: condition?.HasTwelve ? true : false,
        ThirteenId: condition?.HasThirteen ? true : false,
      };
    }
    return initialRenderCondition;
  };

  const defaultValue = id ? data?.Data && data?.Data[0] : null;

  useEffect(() => {
    if (!id || defaultValue !== null) {
      let formData = [];

      if (defaultValue !== null && defaultValue) {
        formData = formConfig.map((item) => {
          const storedDataValue = storedData?.find(
            (i) => i.name === item.name,
          )?.value;

          const correctValue = storedDataValue
            ? storedDataValue
            : defaultValue[item.name];
          const newValue = {
            ...item,
            value: correctValue,
            originalValue: defaultValue[item.name],
            isTitleField: item.name === titleKey,
          };

          return newValue;
        });

        formData.push({
          name: baseFieldKey,
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
          value: undefined,
          originalValue: undefined,
        }));
      }

      dispatch(setAllPageData(formData));
      dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
    }
  }, [defaultValue]);

  useEffect(() => {
    setColumnsConfig([]);
    setDetailsInitialData([]);
    if (active) {
      if (active.detailKey === "CashStatements") {
        setColumnsConfig([
          {
            fieldName: "CashierId",
            fieldCaption: "صندوقدار",
            fieldType: "selectOption",
            dynamicValue: {
              endpoint: "/api/trh/Select/Cashier4SelectOption",
              repoViewId: 140002,
            },
            order: 4,
          },
          ...columnConfig,
        ]);
      } else if (active.detailKey === "TankhahStatements") {
        setColumnsConfig([
          {
            fieldName: "TankhahdarId",
            fieldCaption: "تنخواه دار",
            fieldType: "selectOption",
            dynamicValue: {
              endpoint: "/api/trh/Select/TankhahDar4SelectOption",
              repoViewId: 140002,
            },
            order: 4,
          },
          ...columnConfig,
        ]);
      } else if (active.detailKey === "BankStatements") {
        setColumnsConfig([
          {
            fieldName: "BankAccountId",
            fieldCaption: "حساب بانکی",
            fieldType: "selectOption",
            dynamicValue: {
              endpoint: "api/trh/select/bankAccount4SelectOption",
              repoViewId: 106081,
            },
            order: 4,
          },
          ...columnConfig,
        ]);
      } else {
        setColumnsConfig(columnConfig);
      }

      const detailData = activePage?.pageData?.find(
        (item) => item.name === active.detailKey,
      );

      const originalDetailData = detailData?.originalValue ?? [];
      const valueDetailData = detailData?.value ?? [];

      const filteredOriginalValue = originalDetailData.filter(
        (originalItem) =>
          !valueDetailData.some(
            (valueItem) => valueItem.key === originalItem[active.fieldKey],
          ),
      );

      const areArraysEqual = (a: any[], b: any[]) =>
        JSON.stringify(a) === JSON.stringify(b);

      const defaultDetailData = areArraysEqual(
        originalDetailData,
        valueDetailData,
      )
        ? originalDetailData
        : [...filteredOriginalValue, ...valueDetailData];

      setDetailsInitialData(defaultDetailData ?? []);
    }
  }, [active]);

  return (
    <>
      {(!id || (defaultValue !== null && defaultValue)) && (
        <div className="flex flex-col gap-5">
          <div
            className={`${
              isShowForm
                ? "opacity-100 transform translate-y-1"
                : "opacity-0 transform translate-y-0 pointer-events-none"
            }  transition-all duration-500 ease-in-out`}
          >
            {isShowForm && (
              <AdvancedBankWithdrawalForm activePage={activePage} form={form} />
            )}
          </div>
          <WithdrawalTab active={active} setActive={setActive} />
          <div className="flex items-center gap-2 pt-8">
            <div
              className={`${isShowForm ? "rotate-180" : ""} `}
              onClick={() => !match && setShowForm(!isShowForm)}
            >
              <DownChevron />
            </div>

            <div className="flex justify-between items-center w-full">
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

          {rpWayData?.Data && accountTree?.Data && (
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
                !match ? "h-full" : "h-[calc(100dvh-400px)]"
              }  flex hidden-show-scrollBar transition-all duration-200 overflow-y-auto flex-col justify-between gap-2`}
            >
              {match ? (
                <DetailDataGrid.Desktop<any>
                  key={`${active.key}-${active.detailKey}`}
                  isEdit={isEdit}
                  fieldKey={active.fieldKey}
                  alternateKey={active.fieldKey}
                  detailKey={active.detailKey}
                  detailCaption={active.detailCaption}
                  dragUrl={detailDragUrl}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnsConfig}
                  conditionRenderer={renderConditionalColumn}
                  contentHeight={400}
                />
              ) : (
                <DetailDataGrid.Mobile<any>
                  key={`${active.key}-${active.detailKey}`}
                  isEdit={isEdit}
                  fieldKey={active.fieldKey}
                  alternateKey={active.fieldKey}
                  detailKey={active.detailKey}
                  detailCaption={active.detailCaption}
                  detailInitialData={detailsInitialData ?? []}
                  columnsConfig={columnsConfig}
                  conditionRenderer={renderConditionalColumn}
                  contentHeight={190}
                  ref={childRef}
                  setShowForm={setShowForm}
                />
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
