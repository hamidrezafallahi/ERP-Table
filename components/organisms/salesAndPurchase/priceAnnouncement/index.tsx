"use client";
import { DetailDataGrid } from "@components/molecules/detailDataGrid";
import { IChildHandle } from "@components/molecules/detailDataGrid/mobile/type";
import { PriceAnnouncementForm } from "@components/molecules/salesAndPurchase/priceAnnouncementForm";
import { useAppSelector } from "@redux/index";
import { IPlaceConfig } from "@services/auth/base/type";
import { useCUDDataMutation, useGetData } from "@services/base";
import { IInventoryVoucherDetail } from "@services/inv/inventoryVoucherDetail/type";
import { IRequest } from "@services/reportFile/type";
import { ISalesInvoiceDetails } from "@services/sale/salesInvoiceDetails/type";
import { setPageData } from "@slice/pages";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { columnConfig } from "./config";

export const PriceAnnouncement = ({ form }) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { activePage, fullScreen, minimizePanel, match, init, locale } =
    useAppSelector(
      (state) => ({
        activePage: state.withPersist.pages?.find((item) => item.isActive),
        fullScreen: state.withPersist.config.fullScreen,
        minimizePanel: state.withoutPersist.container.minimize,
        init: state?.withPersist?.init,
        locale: state.withPersist.config.lang,
        match: state.withPersist.config.initMatch,
      }),
      shallowEqual,
    );
  const detailRequiredKey = "CustomerId";
  const detailRequiredValue = activePage?.pageData?.find(
    (item) => item.name === detailRequiredKey,
  );
  const [columnsConfig, setColumnsConfig] = useState(columnConfig);
  const [detailsInitialData, setDetailsInitialData] = useState([]);
  const [headerId, setHeaderId] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [trigger, { isLoading: triggerIsLoading }] = useCUDDataMutation();
  const childRef = useRef<IChildHandle>(null);
  const params = useSearchParams();
  const id = Number(params.get("id"));

  const { data: renderCondition } = useGetData<IPlaceConfig[], null>({
    url: `/api/mng/select/placeConfigValue`,
    body: {},
  });

  const recordsPerPage = !match
    ? 10
    : Math.floor((window.innerHeight - 500) / 40);

  const { data: detailsTotal } = useGetData<null, null>({
    url: "",
    body: {
      RepoViewId: 0,
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
  const measurementUnitsNumber =
    renderCondition?.Data[0]?.SaleConfig?.InvoiceMeasurementUnits;

  const detailInitial = activePage?.pageData?.find(
    (item) => item.name === "Details",
  )?.value;
  const renderConditionalColumn = (
    conditionalValue: number,
    fieldName: string,
    initialRenderCondition: Record<string, boolean>,
  ) => {
    if (conditionalValue) {
      if (measurementUnitsNumber === 1) {
        return {
          ...initialRenderCondition,
          Unit1Id: true,
          Quantity1: true,
        };
      }
      if (measurementUnitsNumber === 2) {
        return {
          ...initialRenderCondition,
          Unit1Id: true,
          Quantity1: true,
          Unit2Id: true,
          Quantity2: true,
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
        };
      }
    }
  };

  const { data: detailsData, isFetching: isLoading } = useGetData<
    ISalesInvoiceDetails[],
    IRequest
  >({
    url: "/api/sale/select/SaleQuatation/detail",
    body: {
      RepoViewId: 0,
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

  useEffect(() => {
    if (detailsData && detailsData?.Data?.length > 0) {
      const correctDetailData = detailsData?.Data?.map((item) => {
        const rowTotalPrice = item?.["FinalQuantity"] * item?.["Fee"] || 0;

        let decreasingValue = 0;
        const discountItems =
          item?.["DiscountItems"]?.map((el) => ({
            ...el,
            id: el.DiscountId,
            amount: el.DiscountType
              ? (item?.FinalQuantity * item?.Fee * el.DiscountAmount) / 100
              : el.DiscountAmount,

            deletable: false,
          })) || [];

        if (rowTotalPrice && discountItems?.length > 0) {
          const calcAmount = discountItems?.map((discount) => ({
            amount: discount.DiscountType
              ? (rowTotalPrice * discount.DiscountAmount) / 100
              : discount.DiscountAmount,
          }));
          decreasingValue =
            calcAmount.reduce((total, item) => total + item["amount"], 0) || 0;
        }

        const totalPriceForTaxItems = rowTotalPrice - decreasingValue;
        const data = {
          ...item,
          key: item["PriceAnnouncementDetailId"],
          TaxItems:
            item?.TaxItems.map((el) => ({
              ...el,
              id: el.TaxId,
              amount: totalPriceForTaxItems * (el.TaxRate / 100),
              deletable: false,
            })) || [],
          TaxIds: item?.TaxItems?.map((item) => item.TaxId) || [],
          DiscountIds:
            item?.DiscountItems?.map((item: any) => item.DiscountId) || [],
          DiscountItems: discountItems,
        };
        return data;
      });

      dispatch(
        setPageData({
          name: "Details",
          value: correctDetailData,
          originalValue: correctDetailData,
        }),
      );
      if (detailInitial && detailInitial?.length > 0) {
        setDetailsInitialData([...correctDetailData, ...detailInitial]);

        dispatch(
          setPageData({
            name: "Details",
            value: [...correctDetailData, ...detailInitial],
            originalValue: [...correctDetailData, ...detailInitial],
          }),
        );
      } else {
        setDetailsInitialData(correctDetailData);
        dispatch(
          setPageData({
            name: "Details",
            value: correctDetailData,
            originalValue: correctDetailData,
          }),
        );
      }
    } else {
      if (detailInitial && detailInitial?.length > 0) {
        setDetailsInitialData(detailInitial);
      }
    }
  }, [detailsData?.Data, activePage?.pageId]);

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
              const rowTotalPrice =
                rowData?.["FinalQuantity"] * rowData?.["Fee"] || 0;

              let decreasingValue = 0;
              const discountItems = rowData?.["DiscountItems"];

              if (rowTotalPrice && discountItems?.length > 0) {
                const calcAmount = discountItems.map((discount) => ({
                  amount: discount.DiscountType
                    ? (rowTotalPrice * discount.DiscountAmount) / 100
                    : discount.DiscountAmount,
                }));
                decreasingValue =
                  calcAmount.reduce(
                    (total, item) => total + item["amount"],
                    0,
                  ) || 0;
              }

              const totalPriceForTaxItems = rowTotalPrice - decreasingValue;

              let increasingValue = 0;

              const taxItems = rowData?.["TaxItems"];
              if (taxItems?.length > 0) {
                const calcAmount = taxItems.map((tax) => ({
                  amount: totalPriceForTaxItems * (tax.TaxRate / 100),
                }));
                increasingValue =
                  calcAmount.reduce(
                    (total, item) => total + item["amount"],
                    0,
                  ) || 0;
              }

              return increasingValue;
            },
          },
          fieldIcon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.61892 2.08203C5.40473 2.13266 4.11144 2.34416 3.2278 3.2278C2.34416 4.11144 2.13266 5.40473 2.08203 7.61892M12.3785 2.08203C14.5927 2.13266 15.886 2.34416 16.7696 3.2278C17.6532 4.11144 17.8647 5.40473 17.9154 7.61892M12.3785 17.9154C14.5927 17.8647 15.886 17.6532 16.7696 16.7696C17.6532 15.886 17.8647 14.5927 17.9154 12.3785M7.61892 17.9154C5.40473 17.8647 4.11144 17.6532 3.2278 16.7696C2.34416 15.886 2.13266 14.5927 2.08203 12.3785" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66781 6.66797H6.67529" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.3319 13.332H13.3394" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66797 13.3346L13.3346 6.66797" stroke="#585858" strokeWidth="1.5" strokeLinecap="round"/></svg>`,
          mobileRender: true,
          independentValue: true,
          order: 12,
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
              const rowTotalPrice =
                rowData?.["FinalQuantity"] * rowData?.["Fee"];
              const discountItems = rowData?.["DiscountItems"];

              let decreasingValue = 0;

              if (rowTotalPrice && discountItems?.length > 0) {
                const calcAmount = discountItems.map((discount) => ({
                  amount: discount.DiscountType
                    ? (rowTotalPrice * discount.DiscountAmount) / 100
                    : discount.DiscountAmount,
                }));
                decreasingValue =
                  calcAmount.reduce(
                    (total, item) => total + item["amount"],
                    0,
                  ) || 0;
              }

              return decreasingValue;
            },
          },
          fieldIcon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.61892 2.08203C5.40473 2.13266 4.11144 2.34416 3.2278 3.2278C2.34416 4.11144 2.13266 5.40473 2.08203 7.61892M12.3785 2.08203C14.5927 2.13266 15.886 2.34416 16.7696 3.2278C17.6532 4.11144 17.8647 5.40473 17.9154 7.61892M12.3785 17.9154C14.5927 17.8647 15.886 17.6532 16.7696 16.7696C17.6532 15.886 17.8647 14.5927 17.9154 12.3785M7.61892 17.9154C5.40473 17.8647 4.11144 17.6532 3.2278 16.7696C2.34416 15.886 2.13266 14.5927 2.08203 12.3785" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66781 6.66797H6.67529" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.3319 13.332H13.3394" stroke="#585858" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66797 13.3346L13.3346 6.66797" stroke="#585858" strokeWidth="1.5" strokeLinecap="round"/></svg>`,
          mobileRender: true,
          independentValue: true,
          order: 10,
        },
      ]);

      if (
        detailRequiredValue?.originalValue !== detailRequiredValue?.value &&
        !!detailRequiredValue?.originalValue
      ) {
        dispatch(
          setPageData({
            name: "Details",
            value: [],
            originalValue: [],
          }),
        );
      }
    }
  }, [detailRequiredValue?.value]);
  return (
    <div className="flex flex-col gap-10">
      <PriceAnnouncementForm form={form} activePage={activePage} />
      {match ? (
        <DetailDataGrid.Desktop<IInventoryVoucherDetail>
          isEdit={false}
          fieldKey="PriceAnnouncementDetailId"
          alternateKey="PriceAnnouncementDetailId"
          detailKey="Details"
          detailCaption=""
          dragUrl=""
          detailInitialData={detailsInitialData ?? []}
          columnsConfig={columnsConfig}
          conditionRenderer={renderConditionalColumn}
          currentPage={pageNumber}
          contentHeight={555}
        />
      ) : (
        <DetailDataGrid.Mobile<IInventoryVoucherDetail>
          isEdit={false}
          fieldKey="PriceAnnouncementDetailId"
          alternateKey="PriceAnnouncementDetailId"
          detailKey="Details"
          detailCaption=""
          detailInitialData={detailsInitialData ?? []}
          columnsConfig={columnsConfig}
          conditionRenderer={renderConditionalColumn}
          currentPage={pageNumber}
          contentHeight={190}
          isLoading={triggerIsLoading}
          ref={childRef}
          setPage={setPageNumber}
          totalCount={detailsTotal?.TotalCount}
        />
      )}
    </div>
  );
};
