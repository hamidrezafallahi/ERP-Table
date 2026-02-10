"use client";
import { Dispatch, useEffect, useRef, useState } from "react";

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
import type { IChildHandle } from "@components/molecules/detailDataGrid/mobile/type";
import type {
  IActions,
  IAdditionalAction,
} from "@components/molecules/detailDataGrid/type";
import {
  DiscountsDetail,
  DiscountsInfo,
  IncreasingAndDecreasingFactors,
  InvoiceInfo,
  Settlement,
  StandardSalesInvoiceForm,
  TaxesDetail,
  TaxesInfo,
} from "@components/molecules/salesAndPurchase/salesInvoice";
import { useAppSelector } from "@redux/index";
import type { IPlaceConfig } from "@services/auth/base/type";
import {
  useCUDDataMutation,
  useGetConditionallyMutation,
  useGetData,
} from "@services/base";
import type { IBaseQueryResponse } from "@services/base/type";
import { RowStateEnum } from "@services/generalType/type";
import type { ISalesInvoiceDetails } from "@services/sale/salesInvoiceDetails/type";
import type {
  IRequest,
  IStandardSalesInvoice,
} from "@services/sale/standardSalesInvoice/type";
import {
  setAllPageData,
  setPageData,
  setPageInfo,
  setPageState,
  setSavePageData,
} from "@slice/pages";
import { PageStateEnum } from "@slice/pages/enum";
import {
  findingPageState,
  showInfoToast,
  showSuccessToast,
  transformDotNotationToNested,
} from "@utils/core";

import { columnConfig, formConfig } from "./config";

export const StandardSalesInvoice = ({ setMobileDrawerContent, form }) => {
  const titleKey = "VoucherNumber";
  const fieldKey = "InvoiceHeaderId";
  const alternateKey = "InvoiceDetailId";
  const detailCaption = "اقلام فاکتور فروش";
  const detailKey = "Details";
  const repoViewId = 130008;
  const detailRepoViewId = 130007;
  const detailDragUrl = "";
  const getUrl = "/api/sale/select/invoice";
  const getDetailUrl = "/api/sale/select/invoice/detail";
  const createUrl = "api/sale/insert/invoice";
  const updateUrl = "api/sale/update/invoice";
  const deleteUrl = "api/sale/delete/invoice";

  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const formHeight = 580;
  const mobileRecordsPerPage = 10;

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
            state.withPersist.pages?.find((item) => item.isActive)?.listUrl,
        ),
        match: state.withPersist.config.initMatch,
      }),
      shallowEqual,
    );

  const storedData = activePage?.pageData;
  const pageId = activePage?.pageId;
  const info = {
    addEndpoint: createUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };

  const detailRequiredKey = "CustomerId";
  const detailRequiredValue = activePage?.pageData?.find(
    (item) => item.name === detailRequiredKey,
  );

  const detailInitial = activePage?.pageData?.find(
    (item) => item.name === detailKey,
  )?.value;

  const [headerId, setHeaderId] = useState(null);
  const [isShowForm, setShowForm] = useState(true);
  const [detailsInitialData, setDetailsInitialData] = useState([]);
  const [columnsConfig, setColumnsConfig] = useState(columnConfig);
  const [pageNumber, setPageNumber] = useState(1);
  const [settlementModalIsOpen, setSettlementModalIsOpen] = useState(false);
  const [detailConfigModal, setDetailConfigModal] = useState<{
    record: ISalesInvoiceDetails;
    index: number;
    helpers: {
      detailData: ISalesInvoiceDetails[];
      dispatchDetailData: Dispatch<IActions<ISalesInvoiceDetails>>;
    };
  }>(null);
  const [detailTaxModalIsOpen, setDetailTaxModalIsOpen] = useState(false);
  const [detailDiscountModalIsOpen, setDetailDiscountModalIsOpen] =
    useState(false);

  const [sourceId, setSourceId] = useState(id);

  const [totalValues, setTotalValues] = useState<{
    totalDetailAmount: number;
    beforeTaxAmount: number;
    detailDecreasing: number;
    detailIncreasing: number;
  }>({
    totalDetailAmount: 0,
    beforeTaxAmount: 0,
    detailDecreasing: 0,
    detailIncreasing: 0,
  });
  const [totalOtherValues, setTotalOtherValues] = useState<{
    otherDecreasing: number;
    otherIncreasing: number;
    taxes: number;
    discounts: number;
  }>({
    otherDecreasing: 0,
    otherIncreasing: 0,
    taxes: 0,
    discounts: 0,
  });

  const [trigger, { isLoading: triggerIsLoading }] = useCUDDataMutation();

  const { data } = useGetData<IStandardSalesInvoice[], IRequest>({
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

  const { data: renderCondition } = useGetData<IPlaceConfig[], null>({
    url: `/api/mng/select/placeConfigValue`,
    body: {},
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

  const handleSettlementAction = async () => {
    if (sourceId) setSettlementModalIsOpen(true);
    if (!sourceId) {
      const body = {};
      const changedFields = [];

      if (!isEdit) {
        storedData.forEach((item) => {
          if (
            item.value !== undefined &&
            item.value !== null &&
            item.type !== "noShow"
          ) {
            if (item.type == "array") {
              body[item.name] = item.value;
            } else if (item.type == "text") {
              body[item.name] = item.value;
            } else if (item.type == "date") {
              try {
                body[item.name] = item.value;
              } catch (error) {
                null;
              }
            } else if (item.type == "number") {
              body[item.name] = +item.value;
            } else {
              body[item.name] = item.value;
            }
          }
        });
      } else {
        storedData.forEach((item) => {
          if (
            (item.value !== undefined && item.value !== item.originalValue) ||
            item.caption === "MainIdField"
          ) {
            if (
              item.caption !== "MainIdField" &&
              item.name !== "Details" &&
              item.name !== "BankStatements" &&
              item.name !== "TafsiliStatements" &&
              item.name !== "TankhahStatements" &&
              item.name !== "CashStatements"
            ) {
              changedFields.push(item.name);
            }

            if (item.type == "array") {
              body[item.name] = item.value;
            } else if (item.type == "text") {
              body[item.name] = item?.value?.toString();
            } else if (item.type == "date") {
              try {
                body[item.name] = item.value;
              } catch (error) {
                null;
              }
            } else if (item.type == "number") {
              body[item.name] = +item.value;
            } else {
              body[item.name] = item.value;
            }
          }
        });
      }
      const cleanBody = transformDotNotationToNested(body);
      try {
        const result = await trigger({
          url: isEdit
            ? activePage.pageInfo.updateEndpoint
            : activePage.pageInfo.addEndpoint,
          body: isEdit
            ? {
                ...cleanBody,
                ChangeFields: changedFields,
              }
            : cleanBody,
          id: isEdit ? id : null,
        }).unwrap();
        if (
          result &&
          (result?.Result === "Success" || result?.Result === "Pending")
        ) {
          if (result?.Result === "Success") {
            showSuccessToast(t("toast.save"));
          }
          if (result?.Result === "Pending") {
            showInfoToast(t("toast.Pending"));
          }

          dispatch(setSavePageData(result.Key));
          dispatch(
            setPageState({
              ...activePage,
              caption:
                activePage.caption +
                " - " +
                storedData.find((i) => i.isTitleField === true)?.value,

              pageState: findingPageState(result.PendingStatusId),
            }),
          );

          dispatch(
            setPageState({
              ...listPage,
              pageState: PageStateEnum.NeedReload,
            }),
          );
          if (result?.Key) {
            setSourceId(result.Key);
            setSettlementModalIsOpen(true);
          }
        }
      } catch (error) {
        null;
      }
    }
  };

  const measurementUnitsNumber =
    renderCondition?.Data[0]?.SaleConfig?.InvoiceMeasurementUnits;

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

  const defaultValue = id ? data?.Data && data?.Data[0] : null;

  const [getIndependentValue] = useGetConditionallyMutation();

  const calcIndependentValue = async (
    rowData: ISalesInvoiceDetails,
    fieldName: string,
    newValue: any,
  ) => {
    const requiredDependentKeys = ["GoodsId", "Quantity1", "Unit1Id", "RowNum"];
    const optionalDependentKeys = [
      "Unit2Id",
      "Quantity2",
      "Unit3Id",
      "Quantity3",
    ];

    const correctRequiredKeys = requiredDependentKeys?.filter(
      (i) => i !== fieldName,
    );
    const correctOptionalKeys = optionalDependentKeys?.filter(
      (i) => i !== fieldName,
    );

    const requiredBody = correctRequiredKeys.reduce(
      (acc, key) => {
        if (rowData[key] !== undefined) {
          acc[key] = rowData[key];
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    const optionalBody = correctOptionalKeys.reduce(
      (acc, key) => {
        if (rowData[key] !== undefined) {
          acc[key] = rowData[key];
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    const hasAllRequiredValues = correctRequiredKeys.every(
      (key) => rowData[key] !== undefined && rowData[key] !== null,
    );
    if (!hasAllRequiredValues) return;

    try {
      const values: IBaseQueryResponse<Partial<ISalesInvoiceDetails[]>> =
        await getIndependentValue({
          url: "api/sale/select/invoiceDetail/additionalItems",
          body: {
            RepoViewId: 130007,
            [detailRequiredKey]: detailRequiredValue?.value,
            [fieldName]: newValue,
            ...requiredBody,
            ...optionalBody,
          },
        }).unwrap();

      if (values?.Result == "Success" && values?.Data) {
        const totalPrice =
          values?.Data[0]?.FinalQuantity * values?.Data[0]?.Fee;
        const discountItems =
          values?.Data[0]?.DiscountItems?.map((item: any) => ({
            ...item,
            id: item.DiscountId,
            amount: item.DiscountType
              ? (totalPrice * item.DiscountAmount) / 100
              : item.DiscountAmount,

            deletable: false,
          })) || [];
        const discountsValue =
          discountItems?.reduce((total, item) => total + item["amount"], 0) ||
          0;
        const taxTotalPrice = totalPrice - discountsValue;
        const taxItems =
          values?.Data[0]?.TaxItems?.map((item) => ({
            ...item,
            id: item.TaxId,
            amount: taxTotalPrice * (item.TaxRate / 100),

            deletable: false,
          })) || [];
        const taxIds =
          values?.Data[0]?.TaxItems.map((item) => item.TaxId) || [];
        const discountIds =
          values?.Data[0]?.DiscountItems.map((item) => item.DiscountId) || [];
        const data = {
          ...values?.Data[0],
          FinalQuantity: values?.Data[0]?.FinalQuantity,
          Fee: values?.Data[0]?.Fee,
          TaxItems: taxItems,
          TaxIds: taxIds,
          DiscountIds: discountIds,
          DiscountItems: discountItems,
        };
        return data;
      }
    } catch (err) {
      null;
    }
  };

  const additionalAction: IAdditionalAction<ISalesInvoiceDetails>[] = [
    {
      label: t("general.tax"),
      // shortcutKey: "Ctrl + Q",
      handler: ({ record, index, helpers }) => {
        setDetailConfigModal({ record, index, helpers });
        setDetailTaxModalIsOpen(true);
      },
    },
    {
      label: t("general.discount"),
      // shortcutKey: "Ctrl + Q",
      handler: ({ record, index, helpers }) => {
        setDetailConfigModal({ record, index, helpers });
        setDetailDiscountModalIsOpen(true);
      },
    },
  ];

  const calculateParameter = (detailsData: ISalesInvoiceDetails[]) => {
    function calculateTotalAmount(rowData: ISalesInvoiceDetails): number {
      if (rowData?.RowState === RowStateEnum.Delete) return 0;
      return rowData["FinalQuantity"] * rowData["Fee"] || 0;
    }
    function calculateDetailIncreasing(rowData: ISalesInvoiceDetails): number {
      if (rowData?.RowState === RowStateEnum.Delete) return 0;
      const rowTotalPrice = rowData?.["FinalQuantity"] * rowData?.["Fee"] || 0;
      let decreasingValue = 0;
      const discountItems = rowData?.["DiscountItems"];
      if (rowTotalPrice && discountItems?.length > 0) {
        const calcAmount = discountItems.map((discount) => ({
          amount: discount.DiscountType
            ? (rowTotalPrice * discount.DiscountAmount) / 100
            : discount.DiscountAmount,
        }));
        decreasingValue =
          calcAmount.reduce((total, item) => total + item["amount"], 0) || 0;
      }

      const totalPriceForTaxItems = rowTotalPrice - decreasingValue;

      let increasingValue = 0;

      const taxItems = rowData?.["TaxItems"];
      if (taxItems?.length > 0) {
        const calcAmount = taxItems.map((tax) => ({
          amount: totalPriceForTaxItems * (tax.TaxRate / 100),
        }));
        increasingValue =
          calcAmount.reduce((total, item) => total + item["amount"], 0) || 0;
      }

      return increasingValue;
    }
    function calculateDetailDecreasing(rowData: ISalesInvoiceDetails): number {
      if (rowData?.RowState === RowStateEnum.Delete) return 0;
      const rowTotalPrice = rowData?.["FinalQuantity"] * rowData?.["Fee"];
      const discountItems = rowData?.["DiscountItems"];

      let decreasingValue = 0;

      if (rowTotalPrice && discountItems?.length > 0) {
        const calcAmount = discountItems.map((discount) => ({
          amount: discount.DiscountType
            ? (rowTotalPrice * discount.DiscountAmount) / 100
            : discount.DiscountAmount,
        }));
        decreasingValue =
          calcAmount.reduce((total, item) => total + item["amount"], 0) || 0;
      }

      return decreasingValue;
    }

    let totalDecreasing = 0;
    let totalIncreasing = 0;
    let totalAmount = 0;
    for (const rowData of detailsData) {
      totalAmount += calculateTotalAmount(rowData);
      totalIncreasing += calculateDetailIncreasing(rowData);
      totalDecreasing += calculateDetailDecreasing(rowData);
    }

    setTotalValues({
      detailDecreasing: totalDecreasing,
      detailIncreasing: totalIncreasing,
      totalDetailAmount: totalAmount,
      beforeTaxAmount: totalAmount - totalDecreasing,
    });

    return {
      decreasing: totalDecreasing,
      increasing: totalIncreasing,
      total: totalAmount,
    };
  };

  useEffect(() => {
    let formData = [];

    if (defaultValue !== null && defaultValue) {
      const discountItems =
        defaultValue?.DiscountItems?.map((item) => ({
          ...item,
          id: item.DiscountId,
          amount: item.DiscountType
            ? (defaultValue?.PureAmount * item.DiscountAmount) / 100
            : item.DiscountAmount,

          deletable: false,
        })) || [];
      const taxItems =
        defaultValue?.TaxItems?.map((item) => ({
          ...item,
          id: item.TaxId,
          amount: defaultValue?.PureAmount * (item.TaxRate / 100),
          deletable: false,
        })) || [];
      const correctDefaultValue = {
        ...defaultValue,
        TaxItems: taxItems,
        DiscountItems: discountItems,
      };
      formData = formConfig.map((item) => {
        const storedDataValue = storedData?.find(
          (i) => i.name === item.name,
        )?.value;

        const correctValue = storedDataValue
          ? storedDataValue
          : correctDefaultValue[item.name];

        const storedDataOriginalValue = storedData?.find(
          (i) => i.name === item.name,
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

    dispatch(setAllPageData(formData));
    dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
  }, [defaultValue, pageId]);

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
          key: item[alternateKey],
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
        }),
      );
      if (detailInitial && detailInitial?.length > 0) {
        setDetailsInitialData([...correctDetailData, ...detailInitial]);

        dispatch(
          setPageData({
            name: detailKey,
            value: [...correctDetailData, ...detailInitial],
            originalValue: [...correctDetailData, ...detailInitial],
          }),
        );
      } else {
        setDetailsInitialData(correctDetailData);
        dispatch(
          setPageData({
            name: detailKey,
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
            name: detailKey,
            value: [],
            originalValue: [],
          }),
        );
      }
    }
  }, [detailRequiredValue?.value]);

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
                <StandardSalesInvoiceForm form={form} />
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
                  totalValues={{
                    totalDetailAmount: totalValues.totalDetailAmount,
                    beforeTaxAmount: totalValues.beforeTaxAmount,
                    detailDecreasing: totalValues.detailDecreasing,
                    detailIncreasing: totalValues.detailIncreasing,
                    totalDetailAdditionalAmount: null,
                    vatBaseAmount: null,
                  }}
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
              // totalDetailAmount={totalValues.totalDetailAmount}
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
              // totalDetailAmount={totalValues.totalDetailAmount}
              detailRequiredValue={detailRequiredValue?.value}
            />
          }
        />
      )}
    </>
  );
};
