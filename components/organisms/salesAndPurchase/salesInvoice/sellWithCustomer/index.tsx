"use client";
import { useEffect } from "react";

import { Pagination } from "antd";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton, CustomModal } from "@components/atoms/defaultElements";
import {
  DownChevron,
  LeftChevron,
  RightChevron,
  SettlementIcon,
} from "@components/atoms/iconComponents";
import { DetailDataGrid } from "@components/molecules/detailDataGrid";
import {
  DiscountsDetail,
  DiscountsInfo,
  IncreasingAndDecreasingFactors,
  InvoiceInfo,
  SellWithCustomerForm,
  Settlement,
  TaxesDetail,
  TaxesInfo,
} from "@components/molecules/salesAndPurchase/salesInvoice";
import { EtcFactorDetail } from "@components/molecules/salesAndPurchase/salesInvoice/etcFactorDetail";
import { useAppSelector } from "@redux/index";
import type { ISalesInvoiceDetails } from "@services/sale/salesInvoiceDetails/type";
import { InvoicePatternTypeOneEnum } from "@services/sale/standardSalesInvoice/type";
import { setAllPageData, setPageData, setPageInfo } from "@slice/pages";
import { hasStoredValue } from "@utils/core";

import { useLogic } from "../useLogic";
import { calcDiscount, calcFactor, calcTax } from "../utils";
import { columnConfig, formConfig } from "./config";
import { TanstackDataGrid } from "@components/molecules/tanstackDataGrid";

export const SellWithCustomerSalesInvoice = ({
  setMobileDrawerContent,
  form,
}) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const params = useSearchParams();

  const id = Number(params.get("id"));
  const isEdit = id ? true : false;

  const { activePage, fullScreen, minimizePanel, match, listPage } =
    useAppSelector(
      (state) => ({
        activePage: state.withPersist.pages?.find((item) => item.isActive),
        fullScreen: state.withPersist.config.fullScreen,
        minimizePanel: state.withoutPersist.container.minimize,
        listPage: state?.withPersist?.pages?.find(
          (item) =>
            item.url ===
            state.withPersist.pages?.find((item) => item.isActive)?.listUrl
        ),
        match: state.withPersist.config.initMatch,
      }),
      shallowEqual
    );

  const {
    // Constants

    titleKey,
    fieldKey,
    alternateKey,
    detailCaption,
    detailKey,
    detailDragUrl,
    info,
    recordsPerPage,

    // Actions / Handlers

    handleAddNew,
    handlePaginationChange,
    handleSettlementAction,
    calcIndependentValue,
    calculateParameter,

    // Modals / UI State

    detailConfigModal,
    detailDiscountModalIsOpen,
    detailTaxModalIsOpen,
    isShowForm,
    setShowForm,
    settlementModalIsOpen,
    setDetailConfigModal,
    setDetailDiscountModalIsOpen,
    setDetailTaxModalIsOpen,
    setSettlementModalIsOpen,
    setDetailsInitialData,
    setDetailEtcFactorModalIsOpen,
    detailEtcFactorModalIsOpen,

    // Data / Values

    defaultValue,
    detailsData,
    detailsInitialData,
    detailsTotal,
    detailInitial,
    detailRequiredValue,
    totalValues,
    totalOtherValues,
    setTotalOtherValues,
    isLoading,
    additionalAction,
    triggerIsLoading,
    storedData,

    // Columns / Config

    columnsConfig,
    setColumnsConfig,
    renderConditionalColumn,

    // Pagination / Ref / IDs

    pageId,
    pageNumber,
    setPageNumber,
    headerId,
    setHeaderId,
    sourceId,
    childRef,
    currency,
  } = useLogic({
    activePage,
    id,
    columnConfig,
    isEdit,
    listPage,
    match,
  });

  useEffect(() => {
    if (id && detailsData && detailsData?.Data?.length > 0) {
      const correctDetailData = detailsData?.Data?.map((item) => {
        const pureAmount = item?.["FinalQuantity"] * item?.["Fee"] || 0;
        const factors = item?.["AddElementDetailItems"];
        const discounts = item?.["DiscountItems"];
        const taxes = item?.["TaxItems"];

        const { factorIds, factorItems } = calcFactor(pureAmount, factors);
        const { discountIds, discountItems } = calcDiscount(
          pureAmount,
          discounts,
          factors
        );
        const { taxItems, taxIds } = calcTax(
          pureAmount,
          taxes,
          discounts,
          factors
        );

        const data = {
          ...item,
          key: item[alternateKey],
          TaxItems: taxItems,
          TaxIds: taxIds,
          DiscountIds: discountIds,
          DiscountItems: discountItems,
          AddElementDetailItems: factorItems,
          AddElementDetailIds: factorIds,
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
    }
  }, [detailsData?.Data, pageId]);

  useEffect(() => {
    if (detailRequiredValue?.value) {
      setColumnsConfig([
        ...columnConfig,
        {
          fieldName: "TaxItems",
          fieldCaption: t("general.tax"),
          fieldType: "static",
          staticConfig: {
            mode: "function",
            valueType: "price",
            className: "text-red-600",
            config: (rowData: ISalesInvoiceDetails) => {
              let value = 0;
              const pureAmount = rowData?.["FinalQuantity"] * rowData?.["Fee"];
              const manualPureAmount =
                rowData?.["Quantity1"] * rowData?.["Fee"];
              const correctPureAmount = pureAmount
                ? pureAmount
                : manualPureAmount;
              const factors = rowData?.["AddElementDetailItems"];
              const discounts = rowData?.["DiscountItems"];
              const taxes = rowData?.["TaxItems"];
              if (taxes?.length > 0) {
                const { totalTaxValue } = calcTax(
                  correctPureAmount,
                  taxes,
                  discounts,
                  factors
                );
                value = totalTaxValue;
              }

              return value;
            },
          },
          fieldIcon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.61892 2.08203C5.40473 2.13266 4.11144 2.34416 3.2278 3.2278C2.34416 4.11144 2.13266 5.40473 2.08203 7.61892M12.3785 2.08203C14.5927 2.13266 15.886 2.34416 16.7696 3.2278C17.6532 4.11144 17.8647 5.40473 17.9154 7.61892M12.3785 17.9154C14.5927 17.8647 15.886 17.6532 16.7696 16.7696C17.6532 15.886 17.8647 14.5927 17.9154 12.3785M7.61892 17.9154C5.40473 17.8647 4.11144 17.6532 3.2278 16.7696C2.34416 15.886 2.13266 14.5927 2.08203 12.3785" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66781 6.66797H6.67529" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.3319 13.332H13.3394" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66797 13.3346L13.3346 6.66797" stroke="#585858" strokeWidth="1.5" strokeLinecap="round"/></svg>`,
          mobileRender: true,
          independentValue: true,
          order: 12,
        },
        {
          fieldName: "LegalFundsRate",
          fieldCaption: "وجوه قانونی",
          mobileRender: true,
          fieldType: "static",
          staticConfig: {
            mode: "function",
            valueType: "price",
            config: (rowData) => {
              const value = rowData["LegalFundsAmount"] || 0;

              return value ? value : 0;
            },
          },
          order: 13,
        },
        {
          fieldName: "TaxFundsRate",
          fieldCaption: "سایر مالیات و عوارض",
          mobileRender: true,
          fieldType: "static",
          staticConfig: {
            mode: "function",
            valueType: "price",
            config: (rowData) => {
              const value = rowData["TaxFundsAmount"] || 0;
              return value ? value : 0;
            },
          },
          order: 14,
        },
        {
          fieldName: "DiscountItems",
          fieldCaption: t("general.discount"),
          fieldType: "static",
          staticConfig: {
            mode: "function",
            valueType: "price",
            className: "text-green-600",
            config: (rowData: ISalesInvoiceDetails) => {
              const pureAmount = rowData?.["FinalQuantity"] * rowData?.["Fee"];
              const manualPureAmount =
                rowData?.["Quantity1"] * rowData?.["Fee"];
              const correctPureAmount = pureAmount
                ? pureAmount
                : manualPureAmount;
              const discounts = rowData?.["DiscountItems"];
              const factors = rowData?.["AddElementDetailItems"];

              let value = 0;
              if (discounts?.length > 0) {
                const { totalDiscountValue } = calcDiscount(
                  correctPureAmount,
                  discounts,
                  factors
                );
                value = totalDiscountValue;
              }

              return value;
            },
          },
          fieldIcon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.61892 2.08203C5.40473 2.13266 4.11144 2.34416 3.2278 3.2278C2.34416 4.11144 2.13266 5.40473 2.08203 7.61892M12.3785 2.08203C14.5927 2.13266 15.886 2.34416 16.7696 3.2278C17.6532 4.11144 17.8647 5.40473 17.9154 7.61892M12.3785 17.9154C14.5927 17.8647 15.886 17.6532 16.7696 16.7696C17.6532 15.886 17.8647 14.5927 17.9154 12.3785M7.61892 17.9154C5.40473 17.8647 4.11144 17.6532 3.2278 16.7696C2.34416 15.886 2.13266 14.5927 2.08203 12.3785" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66781 6.66797H6.67529" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.3319 13.332H13.3394" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66797 13.3346L13.3346 6.66797" stroke="#585858" strokeWidth="1.5" strokeLinecap="round"/></svg>`,
          mobileRender: true,
          independentValue: true,
          order: 10,
        },
        {
          fieldName: "AddElementDetailIds",
          fieldCaption: t("general.invoiceEtcFactor"),
          fieldType: "static",
          calcIndependent: true,
          staticConfig: {
            mode: "function",
            valueType: "price",
            // className: "text-green-600",
            config: (rowData: ISalesInvoiceDetails) => {
              const pureAmount = rowData?.["FinalQuantity"] * rowData?.["Fee"];
              const manualPureAmount =
                rowData?.["Quantity1"] * rowData?.["Fee"];
              const correctPureAmount = pureAmount
                ? pureAmount
                : manualPureAmount;
              const factors = rowData?.["AddElementDetailItems"];

              let decFactorsValue = 0;
              let incFactorsValue = 0;

              if (correctPureAmount && factors?.length > 0) {
                const { decreasingFactorValue, increasingFactorValue } =
                  calcFactor(correctPureAmount, factors);
                incFactorsValue = increasingFactorValue;
                decFactorsValue = decreasingFactorValue;
              }

              return incFactorsValue - decFactorsValue;
            },
          },
          fieldIcon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.61892 2.08203C5.40473 2.13266 4.11144 2.34416 3.2278 3.2278C2.34416 4.11144 2.13266 5.40473 2.08203 7.61892M12.3785 2.08203C14.5927 2.13266 15.886 2.34416 16.7696 3.2278C17.6532 4.11144 17.8647 5.40473 17.9154 7.61892M12.3785 17.9154C14.5927 17.8647 15.886 17.6532 16.7696 16.7696C17.6532 15.886 17.8647 14.5927 17.9154 12.3785M7.61892 17.9154C5.40473 17.8647 4.11144 17.6532 3.2278 16.7696C2.34416 15.886 2.13266 14.5927 2.08203 12.3785" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66781 6.66797H6.67529" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.3319 13.332H13.3394" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66797 13.3346L13.3346 6.66797" stroke="#585858" strokeWidth="1.5" strokeLinecap="round"/></svg>`,
          mobileRender: true,
          independentValue: true,
          order: 9,
        },
      ]);

      if (
        detailRequiredValue?.originalValue !== detailRequiredValue?.value &&
        !!detailRequiredValue?.originalValue
      ) {
        dispatch(
          setPageData({
            name: detailKey,
            value: [],
            originalValue: [],
          })
        );
      }
    }
  }, [detailRequiredValue?.value]);

  useEffect(() => {
    const hasStored = Array.isArray(storedData) && storedData.length > 0;
    const isSame =
      storedData?.find((item) => item.name === "eInvoicePatternTypeOne")
        ?.value === InvoicePatternTypeOneEnum.SaleWithCustomer;

    let formData;

    if (defaultValue !== null && defaultValue) {
      const pureAmount = defaultValue?.PureAmount || 0;
      const totalRowAfterDiscount = defaultValue?.TotalRowAfterDiscount || 0;

      const factors = defaultValue?.["AddElement"];
      const discounts = defaultValue?.["DiscountItems"];
      const taxes = defaultValue?.["TaxItems"];

      const { factorItems } = calcFactor(pureAmount, factors);
      const { discountItems } = calcDiscount(
        totalRowAfterDiscount,
        discounts,
        factors
      );
      const { taxItems } = calcTax(
        totalRowAfterDiscount,
        taxes,
        discounts,
        factors
      );

      const correctDefaultValue = {
        ...defaultValue,
        TaxItems: taxItems,
        DiscountItems: discountItems,
        AddElement: factorItems,
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
    } else if (hasStored && isSame) {
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

    if (defaultValue) {
      setHeaderId(defaultValue[fieldKey]);
    } else if (hasStored && isSame) {
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
                <SellWithCustomerForm form={form} currency={currency} />
              </>
            )}
          </div>

          <div className={detailRequiredValue?.value ? "" : "relative"}>
            {!detailRequiredValue?.value && (
              <div className="z-50 absolute inset-0 flex justify-center items-start backdrop-blur-sm pt-32 rounded font-bold text-sm">
                {t("general.customerRequired")}
              </div>
            )}
            <div className="flex items-center gap-2 pt-10">
              <div
                className={`${isShowForm ? "rotate-180  " : ""} `}
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
                !match ? "h-full" : "h-[calc(100dvh-555px)]"
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
                  conditionRenderer={renderConditionalColumn}
                  currentPage={pageNumber}
                  contentHeight={555}
                  additionalActions={additionalAction}
                  additionalFunction={calculateParameter}
                  calcIndependentValue={calcIndependentValue}
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
                  conditionRenderer={renderConditionalColumn}
                  currentPage={pageNumber}
                  contentHeight={190}
                  isLoading={isLoading}
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
            <div
              className={`${
                match ? "grid grid-cols-12" : "flex flex-col overflow-auto"
              } gap-1 overflow-auto `}
            >
              {/* <div className="col-span-12">
                <CustomerInfo />
              </div> */}

              <div className="col-span-3">
                <IncreasingAndDecreasingFactors
                  headerId={headerId}
                  fieldKey={fieldKey}
                  totalDetailAmount={totalValues.totalDetailAmount}
                  setTotalOtherValues={setTotalOtherValues}
                  beforeTaxAmount={totalValues.beforeTaxAmount}
                />
              </div>
              <div className="col-span-3">
                <DiscountsInfo
                  detailRequiredValue={detailRequiredValue?.value}
                  headerId={headerId}
                  fieldKey={fieldKey}
                  totalDetailAmount={totalValues.totalDetailAmount}
                  beforeTaxAmount={totalValues.beforeTaxAmount}
                  setTotalOtherValues={setTotalOtherValues}
                />
              </div>
              <div className="col-span-3">
                <TaxesInfo
                  detailRequiredValue={detailRequiredValue?.value}
                  headerId={headerId}
                  fieldKey={fieldKey}
                  totalDetailAmount={totalValues.totalDetailAmount}
                  beforeTaxAmount={totalValues.beforeTaxAmount}
                  setTotalOtherValues={setTotalOtherValues}
                />
              </div>
              <div className="flex flex-col gap-1 col-span-3">
                <InvoiceInfo
                  totalValues={totalValues}
                  totalOtherValues={totalOtherValues}
                />
                <CustomButton
                  type="text"
                  loading={triggerIsLoading}
                  onClick={handleSettlementAction}
                  className="bg-gray-gray2 hover:bg-gray-gray9 p-2 border border-1 border-gray-gray9 rounded-lg text-gray-gray9 hover:text-white text-xs text-center cursor-pointer"
                >
                  {t("general.invoiceSettlement")}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}
      {detailTaxModalIsOpen && (
        <CustomModal
          contentClassName={`${!match ? "!w-full" : "w-[520px]"}`}
          headerName={t("general.tax")}
          closeModal={() => {
            setDetailTaxModalIsOpen(false);
            setDetailConfigModal(null);
          }}
          isModalOpen={detailTaxModalIsOpen}
          content={
            <TaxesDetail
              detailConfigModal={detailConfigModal}
              detailRequiredValue={detailRequiredValue?.value}
            />
          }
        />
      )}
      {detailDiscountModalIsOpen && (
        <CustomModal
          contentClassName={`${!match ? "!w-full" : "w-[520px]"}`}
          headerName={t("general.discount")}
          closeModal={() => {
            setDetailDiscountModalIsOpen(false);
            setDetailConfigModal(null);
          }}
          isModalOpen={detailDiscountModalIsOpen}
          content={
            <DiscountsDetail
              detailConfigModal={detailConfigModal}
              detailRequiredValue={detailRequiredValue?.value}
            />
          }
        />
      )}
      {detailEtcFactorModalIsOpen && (
        <CustomModal
          contentClassName={`${!match ? "!w-full" : "w-[520px]"}`}
          headerName={t("general.invoiceEtcFactor")}
          closeModal={() => {
            setDetailEtcFactorModalIsOpen(false);
            setDetailConfigModal(null);
          }}
          isModalOpen={detailEtcFactorModalIsOpen}
          content={
            <EtcFactorDetail
              detailConfigModal={detailConfigModal}
              detailRequiredValue={detailRequiredValue?.value}
              calcIndependentValue={calcIndependentValue}
            />
          }
        />
      )}
      {settlementModalIsOpen && (
        <CustomModal
          contentClassName={`${match ? "!w-[750px] h-full" : ""}`}
          headerName={t("general.invoiceSettlement")}
          headerIcon={match ? <SettlementIcon /> : null}
          closeModal={() => setSettlementModalIsOpen(false)}
          isModalOpen={settlementModalIsOpen}
          content={<Settlement id={sourceId} />}
        />
      )}
    </>
  );
};
