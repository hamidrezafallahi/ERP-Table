import {
  Dispatch,
  RefObject,
  SetStateAction,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";

import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";

import type { IChildHandle } from "@components/molecules/detailDataGrid/mobile/type";
import type {
  IActions,
  IAdditionalAction,
} from "@components/molecules/detailDataGrid/type";
import type { IPlaceConfig } from "@services/auth/base/type";
import {
  useCUDDataMutation,
  useGetConditionallyMutation,
  useGetData,
} from "@services/base";
import type { IBaseQueryResponse } from "@services/base/type";
import {
  type IDetailColumnConfig,
  RowStateEnum,
} from "@services/generalType/type";
import type { ISalesInvoiceDetails } from "@services/sale/salesInvoiceDetails/type";
import type {
  IRequest,
  IStandardSalesInvoice,
} from "@services/sale/standardSalesInvoice/type";
import { setPageState, setSavePageData } from "@slice/pages";
import { PageStateEnum } from "@slice/pages/enum";
import type { IPage } from "@slice/pages/type";
import { IFormFieldConfig } from "@type/elementType";
import {
  findingPageState,
  showInfoToast,
  showSuccessToast,
  transformDotNotationToNested,
} from "@utils/core";

import { calcDiscount, calcFactor, calcTax } from "./utils";

export interface IUseLogicProps {
  activePage: IPage;
  id?: number | null;
  columnConfig: IDetailColumnConfig[];
  isEdit?: boolean;
  listPage: IPage;
  match?: boolean;
  type?: "JEWELRY";
}

export interface IUseLogicReturn {
  // CONSTANTS

  titleKey: string;
  fieldKey: string;
  alternateKey: string;
  detailCaption: string;
  detailKey: string;
  detailDragUrl: string;
  info: IPage["pageInfo"];
  recordsPerPage: number;
  currency: string | null;

  // UTILS

  calcIndependentValue: (
    rowData: ISalesInvoiceDetails,
    fieldName: string,
    newValue: any
  ) => Promise<Partial<ISalesInvoiceDetails> | undefined>;
  calculateParameter: (detailsData: ISalesInvoiceDetails[]) => {
    decreasing: number;
    increasing: number;
    total: number;
  };
  renderConditionalColumn: (
    conditionalValue: number,
    fieldName: string,
    initialRenderCondition: Record<string, boolean>
  ) => Record<string, boolean> | undefined;
  additionalAction: IAdditionalAction<ISalesInvoiceDetails>[];
  defaultValue: IStandardSalesInvoice | null | undefined;

  // HANDLERS

  handleSettlementAction: () => Promise<void>;
  handlePaginationChange: (page: number) => void;
  handleAddNew: () => void;

  // DATA

  detailsData?: IBaseQueryResponse<ISalesInvoiceDetails[]>;
  detailsTotal?: IBaseQueryResponse<null>;
  storedData?: IPage["pageData"];
  detailInitial?: ISalesInvoiceDetails[];
  detailRequiredValue?: IFormFieldConfig;
  pageId?: IPage["pageId"];

  // STATES

  headerId: number | null;
  setHeaderId: Dispatch<SetStateAction<number | null>>;
  pageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
  isShowForm: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  sourceId: number | null | undefined;
  totalValues: {
    totalDetailAmount: number;
    totalDetailAdditionalAmount: number;
    beforeTaxAmount: number;
    detailDecreasing: number;
    detailIncreasing: number;
    vatBaseAmount: number;
  };
  totalOtherValues: {
    otherDecreasing: number;
    otherIncreasing: number;
    taxes: number;
    discounts: number;
  };
  setTotalOtherValues: Dispatch<
    SetStateAction<{
      otherDecreasing: number;
      otherIncreasing: number;
      taxes: number;
      discounts: number;
    }>
  >;

  // DETAILS

  detailsInitialData: ISalesInvoiceDetails[];
  setDetailsInitialData: Dispatch<SetStateAction<ISalesInvoiceDetails[]>>;
  columnsConfig: IDetailColumnConfig[];
  setColumnsConfig: Dispatch<SetStateAction<IDetailColumnConfig[]>>;

  // MODALS

  settlementModalIsOpen: boolean;
  setSettlementModalIsOpen: Dispatch<SetStateAction<boolean>>;
  detailTaxModalIsOpen: boolean;
  setDetailTaxModalIsOpen: Dispatch<SetStateAction<boolean>>;
  detailDiscountModalIsOpen: boolean;
  setDetailDiscountModalIsOpen: Dispatch<SetStateAction<boolean>>;
  detailEtcFactorModalIsOpen: boolean;
  setDetailEtcFactorModalIsOpen: Dispatch<SetStateAction<boolean>>;
  detailConfigModal: {
    record: ISalesInvoiceDetails;
    index: number;
    helpers: {
      detailData: ISalesInvoiceDetails[];
      dispatchDetailData: Dispatch<IActions<ISalesInvoiceDetails>>;
    };
  } | null;
  setDetailConfigModal: Dispatch<
    SetStateAction<IUseLogicReturn["detailConfigModal"]>
  >;

  // REFS

  childRef: RefObject<IChildHandle>;

  // LOADING

  isLoading: boolean;
  triggerIsLoading: boolean;
}

export const useLogic = ({
  activePage,
  id,
  columnConfig,
  isEdit,
  listPage,
  match,
  type,
}: IUseLogicProps): IUseLogicReturn => {
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
  const detailRequiredKey = "CustomerId";

  const info = useMemo(
    () => ({
      addEndpoint: createUrl,
      deleteEndpoint: deleteUrl,
      updateEndpoint: updateUrl,
      formIdField: fieldKey,
    }),
    // these values are constants in this hook, so empty deps are fine
    []
  );

  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const formHeight = 580;
  const mobileRecordsPerPage = 10;

  const recordsPerPage = !match
    ? mobileRecordsPerPage
    : Math.floor((deviceHeight - formHeight) / recordHeight);
  const t = useTranslations();
  const dispatch = useDispatch();
  const childRef = useRef<IChildHandle>(null);

  // DATA FROM PROPS

  const storedData = activePage?.pageData;
  const pageId = activePage?.pageId;

  const detailRequiredValue = storedData?.find(
    (item) => item.name === detailRequiredKey
  );
  const detailInitial = storedData?.find(
    (item) => item.name === detailKey
  )?.value;

  // STATES

  const [headerId, setHeaderId] = useState<number | null>(null);
  const [sourceId, setSourceId] = useState(id);
  const [isShowForm, setShowForm] = useState(true);
  const [detailsInitialData, setDetailsInitialData] = useState<
    ISalesInvoiceDetails[]
  >([]);
  const [columnsConfig, setColumnsConfig] = useState(columnConfig);
  const [pageNumber, setPageNumber] = useState(1);
  const [currency, setCurrency] = useState<string | null>(null);

  // MODALS

  const [settlementModalIsOpen, setSettlementModalIsOpen] = useState(false);
  const [detailTaxModalIsOpen, setDetailTaxModalIsOpen] = useState(false);
  const [detailEtcFactorModalIsOpen, setDetailEtcFactorModalIsOpen] =
    useState(false);
  const [detailDiscountModalIsOpen, setDetailDiscountModalIsOpen] =
    useState(false);
  const [detailConfigModal, setDetailConfigModal] = useState<{
    record: ISalesInvoiceDetails;
    index: number;
    helpers: {
      detailData: ISalesInvoiceDetails[];
      dispatchDetailData: Dispatch<IActions<ISalesInvoiceDetails>>;
    };
  } | null>(null);

  // TOTALS

  const [totalValues, setTotalValues] = useState<{
    totalDetailAmount: number;
    totalDetailAdditionalAmount: number;
    beforeTaxAmount: number;
    detailDecreasing: number;
    detailIncreasing: number;
    vatBaseAmount: number;
  }>({
    totalDetailAmount: 0,
    totalDetailAdditionalAmount: 0,
    beforeTaxAmount: 0,
    detailDecreasing: 0,
    detailIncreasing: 0,
    vatBaseAmount: 0,
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

  // QUERIES & MUTATIONS

  const [trigger, { isLoading: triggerIsLoading }] = useCUDDataMutation();
  const [getIndependentValue] = useGetConditionallyMutation();

  const { data } = useGetData<IStandardSalesInvoice[], IRequest>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      Id: id,
      ShowBookmarked: true,
      ShowTags: true,
    },
    skip: !id,
  });

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
      PagingInfo: { PageNumber: pageNumber, PageRecordCount: recordsPerPage },
    },
    skip: !headerId,
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
  });

  const { data: renderCondition } = useGetData<IPlaceConfig[], null>({
    url: `/api/mng/select/placeConfigValue`,
    body: {},
  });

  // HANDLERS

  const handleAddNew = () => childRef.current?.mobileHandleAdd(0);

  const handlePaginationChange = (page: number) => setPageNumber(page);

  const handleSettlementAction = async () => {
    if (sourceId) return setSettlementModalIsOpen(true);

    const body: Record<string, any> = {};
    const changedFields: string[] = [];

    storedData?.forEach((item) => {
      const valueChanged = isEdit
        ? item.value !== item.originalValue || item.caption === "MainIdField"
        : item.value !== undefined &&
          item.value !== null &&
          item.type !== "noShow";

      if (!valueChanged) return;

      if (
        ![
          "Details",
          "BankStatements",
          "TafsiliStatements",
          "TankhahStatements",
          "CashStatements",
        ].includes(item.name)
      ) {
        changedFields.push(item.name);
      }

      body[item.name] = item.type === "number" ? +item.value : item.value;
    });

    const cleanBody = transformDotNotationToNested(body);

    try {
      const result = await trigger({
        url: isEdit
          ? activePage.pageInfo.updateEndpoint
          : activePage.pageInfo.addEndpoint,
        body: isEdit
          ? { ...cleanBody, ChangeFields: changedFields }
          : cleanBody,
        id: isEdit ? id : null,
      }).unwrap();

      if (!result) return;

      if (result?.Result === "Success") showSuccessToast(t("toast.save"));
      if (result?.Result === "Pending") showInfoToast(t("toast.Pending"));

      dispatch(setSavePageData(result.Key));
      dispatch(
        setPageState({
          ...activePage,
          caption:
            activePage.caption +
            " - " +
            storedData?.find((i) => i.isTitleField)?.value,
          pageState: findingPageState(result.PendingStatusId),
        })
      );
      dispatch(
        setPageState({ ...listPage, pageState: PageStateEnum.NeedReload })
      );

      if (result.Key) {
        setSourceId(result.Key);
        setSettlementModalIsOpen(true);
      }
    } catch (error) {
      null;
    }
  };

  // UTILS

  const measurementUnitsNumber =
    renderCondition?.Data[0]?.SaleConfig?.InvoiceMeasurementUnits;

  const renderConditionalColumn = (
    conditionalValue: number,
    fieldName: string,
    initialRenderCondition: Record<string, boolean>
  ) => {
    if (!conditionalValue) return;
    const columns: Record<string, boolean> = {
      ...initialRenderCondition,
      Unit1Id: true,
      Quantity1: true,
    };
    if (measurementUnitsNumber >= 2)
      Object.assign(columns, { Unit2Id: true, Quantity2: true });
    if (measurementUnitsNumber === 3)
      Object.assign(columns, { Unit3Id: true, Quantity3: true });
    return columns;
  };

  const defaultValue = id ? data?.Data?.[0] : null;

  const correctCurrency = defaultValue?.Currency?.CurrencyDesc;

  const calcIndependentValue = async (
    rowData: ISalesInvoiceDetails,
    fieldName: string,
    newValue: any
  ) => {
    const requiredDependentKeys = ["GoodsId", "Quantity1", "Unit1Id", "RowNum"];
    const optionalDependentKeys = [
      "Unit2Id",
      "Quantity2",
      "Unit3Id",
      "Quantity3",
    ];

    let feeChangedData: Partial<ISalesInvoiceDetails> = {};
    let quantityChangedData: Partial<ISalesInvoiceDetails> = {};
    let factorChangedData: Partial<ISalesInvoiceDetails> = {};
    let additionalAmountChangedData: Partial<ISalesInvoiceDetails> = {};
    let serverData: Partial<ISalesInvoiceDetails> = {};

    const correctRequiredKeys = requiredDependentKeys?.filter(
      (i) => i !== fieldName
    );
    const correctOptionalKeys = optionalDependentKeys?.filter(
      (i) => i !== fieldName
    );

    const requiredBody = correctRequiredKeys.reduce((acc, key) => {
      if (rowData[key] !== undefined) {
        acc[key] = rowData[key];
      }
      return acc;
    }, {} as Record<string, any>);

    const optionalBody = correctOptionalKeys.reduce((acc, key) => {
      if (rowData[key] !== undefined) {
        acc[key] = rowData[key];
      }
      return acc;
    }, {} as Record<string, any>);

    const hasAllRequiredValues = correctRequiredKeys.every(
      (key) => rowData[key] !== undefined && rowData[key] !== null
    );

    if (fieldName === "Fee") {
      const pureAmount = rowData?.FinalQuantity * newValue;
      const manualPureAmount = rowData?.Quantity1 * newValue;
      const correctPureAmount = pureAmount ? pureAmount : manualPureAmount;

      const rowTotalAdditional =
        (rowData?.ConstructionCost || 0) +
        (rowData?.SellerProfit || 0) +
        (rowData?.Commission || 0);

      const legalFundsAmount =
        type === "JEWELRY"
          ? (rowData?.LegalFunds &&
              (rowTotalAdditional * rowData?.LegalFundsRate) / 100) ||
            null
          : (rowData?.LegalFunds &&
              (correctPureAmount * rowData?.LegalFundsRate) / 100) ||
            null;
      const legalFundsRate =
        (rowData?.LegalFunds && rowData?.LegalFundsRate) || null;
      const taxFundsAmount =
        type === "JEWELRY"
          ? (rowData?.TaxFundsRate &&
              (rowTotalAdditional * rowData?.TaxFundsRate) / 100) ||
            null
          : (rowData?.TaxFunds &&
              (correctPureAmount * rowData?.TaxFundsRate) / 100) ||
            null;
      const taxFundsRate = (rowData?.TaxFunds && rowData?.TaxFundsRate) || null;

      const { factorItems } = calcFactor(
        correctPureAmount,
        rowData?.AddElementDetailItems
      );
      const { discountItems } = calcDiscount(
        correctPureAmount,
        rowData?.DiscountItems,
        rowData?.AddElementDetailItems
      );
      const { taxItems } = calcTax(
        correctPureAmount,
        rowData?.TaxItems,
        rowData?.DiscountItems,
        rowData?.AddElementDetailItems,
        rowData?.VATBaseAmount,
        rowTotalAdditional,
        type
      );

      feeChangedData = {
        AddElementDetailItems: factorItems,
        TaxItems: taxItems,
        DiscountItems: discountItems,
        LegalFundsAmount: legalFundsAmount,
        LegalFundsRate: legalFundsRate,
        TaxFundsAmount: taxFundsAmount,
        TaxFundsRate: taxFundsRate,
      };
    }

    if (
      fieldName === "Quantity1" &&
      !rowData?.Quantity2 &&
      !rowData?.Quantity3
    ) {
      const correctPureAmount = rowData?.Fee * newValue;

      const rowTotalAdditional =
        (rowData?.ConstructionCost || 0) +
        (rowData?.SellerProfit || 0) +
        (rowData?.Commission || 0);

      const legalFundsAmount =
        type === "JEWELRY"
          ? (rowData?.LegalFunds &&
              (rowTotalAdditional * rowData?.LegalFundsRate) / 100) ||
            null
          : (rowData?.LegalFunds &&
              (correctPureAmount * rowData?.LegalFundsRate) / 100) ||
            null;
      const legalFundsRate =
        (rowData?.LegalFunds && rowData?.LegalFundsRate) || null;
      const taxFundsAmount =
        type === "JEWELRY"
          ? (rowData?.TaxFundsRate &&
              (rowTotalAdditional * rowData?.TaxFundsRate) / 100) ||
            null
          : (rowData?.TaxFunds &&
              (correctPureAmount * rowData?.TaxFundsRate) / 100) ||
            null;
      const taxFundsRate = (rowData?.TaxFunds && rowData?.TaxFundsRate) || null;

      const { factorItems } = calcFactor(
        correctPureAmount,
        rowData?.AddElementDetailItems
      );
      const { discountItems } = calcDiscount(
        correctPureAmount,
        rowData?.DiscountItems,
        rowData?.AddElementDetailItems
      );
      const { taxItems } = calcTax(
        correctPureAmount,
        rowData?.TaxItems,
        rowData?.DiscountItems,
        rowData?.AddElementDetailItems,
        rowData?.VATBaseAmount,
        rowTotalAdditional,
        type
      );

      quantityChangedData = {
        TaxItems: taxItems,
        DiscountItems: discountItems,
        LegalFundsAmount: legalFundsAmount,
        LegalFundsRate: legalFundsRate,
        TaxFundsAmount: taxFundsAmount,
        TaxFundsRate: taxFundsRate,
        AddElementDetailItems: factorItems,
      };
    }

    if (fieldName === "AddElementDetailIds") {
      const pureAmount = rowData?.FinalQuantity * rowData?.Fee;
      const manualPureAmount = rowData?.Quantity1 * rowData?.Fee;
      const correctPureAmount = pureAmount ? pureAmount : manualPureAmount;

      const rowTotalAdditional =
        (rowData?.ConstructionCost || 0) +
        (rowData?.SellerProfit || 0) +
        (rowData?.Commission || 0);

      const legalFundsAmount =
        type === "JEWELRY"
          ? (rowData?.LegalFunds &&
              (rowTotalAdditional * rowData?.LegalFundsRate) / 100) ||
            null
          : (rowData?.LegalFunds &&
              (correctPureAmount * rowData?.LegalFundsRate) / 100) ||
            null;
      const legalFundsRate =
        (rowData?.LegalFunds && rowData?.LegalFundsRate) || null;
      const taxFundsAmount =
        type === "JEWELRY"
          ? (rowData?.TaxFundsRate &&
              (rowTotalAdditional * rowData?.TaxFundsRate) / 100) ||
            null
          : (rowData?.TaxFunds &&
              (correctPureAmount * rowData?.TaxFundsRate) / 100) ||
            null;
      const taxFundsRate = (rowData?.TaxFunds && rowData?.TaxFundsRate) || null;

      const factorItems = newValue;

      const { discountItems } = calcDiscount(
        correctPureAmount,
        rowData?.DiscountItems,
        factorItems
      );
      const { taxItems } = calcTax(
        correctPureAmount,
        rowData?.TaxItems,
        rowData?.DiscountItems,
        factorItems,
        rowData?.VATBaseAmount,
        rowTotalAdditional,
        type
      );

      factorChangedData = {
        TaxItems: taxItems,
        DiscountItems: discountItems,
        LegalFundsAmount: legalFundsAmount,
        LegalFundsRate: legalFundsRate,
        TaxFundsAmount: taxFundsAmount,
        TaxFundsRate: taxFundsRate,
        AddElementDetailItems: factorItems,
      };
    }

    if (
      fieldName === "SellerProfit" ||
      fieldName === "ConstructionCost" ||
      fieldName === "Commission"
    ) {
      const pureAmount = rowData?.FinalQuantity * rowData?.Fee;

      const correctPureAmount = pureAmount;

      const sellerProfitAmount =
        fieldName === "SellerProfit" ? newValue : rowData?.SellerProfit;
      const constructionCostAmount =
        fieldName === "ConstructionCost" ? newValue : rowData?.ConstructionCost;
      const commissionAmount =
        fieldName === "Commission" ? newValue : rowData?.Commission;

      const rowTotalAdditional =
        (sellerProfitAmount || 0) +
        (constructionCostAmount || 0) +
        (commissionAmount || 0);

      const legalFundsAmount =
        type === "JEWELRY"
          ? (rowData?.LegalFunds &&
              (rowTotalAdditional * rowData?.LegalFundsRate) / 100) ||
            null
          : (rowData?.LegalFunds &&
              (correctPureAmount * rowData?.LegalFundsRate) / 100) ||
            null;
      const legalFundsRate =
        (rowData?.LegalFunds && rowData?.LegalFundsRate) || null;
      const taxFundsAmount =
        type === "JEWELRY"
          ? (rowData?.TaxFundsRate &&
              (rowTotalAdditional * rowData?.TaxFundsRate) / 100) ||
            null
          : (rowData?.TaxFunds &&
              (correctPureAmount * rowData?.TaxFundsRate) / 100) ||
            null;
      const taxFundsRate = (rowData?.TaxFunds && rowData?.TaxFundsRate) || null;

      const { taxItems } = calcTax(
        correctPureAmount,
        rowData?.TaxItems,
        rowData?.DiscountItems,
        rowData?.AddElementDetailItems,
        rowData?.VATBaseAmount,
        rowTotalAdditional,
        type
      );

      additionalAmountChangedData = {
        TaxItems: taxItems,
        LegalFundsAmount: legalFundsAmount,
        LegalFundsRate: legalFundsRate,
        TaxFundsAmount: taxFundsAmount,
        TaxFundsRate: taxFundsRate,
      };
    }

    const clientData = {
      ...feeChangedData,
      ...quantityChangedData,
      ...factorChangedData,
      ...additionalAmountChangedData,
    };

    if (
      !hasAllRequiredValues ||
      (type === "JEWELRY" &&
        (fieldName === "ConstructionCost" ||
          fieldName === "SellerProfit" ||
          fieldName === "Commission" ||
          fieldName === "TaxItems"))
    )
      return clientData;

    try {
      const values: IBaseQueryResponse<Partial<ISalesInvoiceDetails[]>> =
        await getIndependentValue({
          url: "api/sale/select/invoiceDetail/additionalItems",
          body: {
            RepoViewId: 130007,
            [detailRequiredKey]: detailRequiredValue?.value,
            HeaderId: isEdit ? id : undefined,
            [fieldName]: newValue,
            ...requiredBody,
            ...optionalBody,
          },
        }).unwrap();

      if (
        values?.Result == "Success" &&
        values?.Data &&
        fieldName !== "AddElementDetailIds"
      ) {
        const serviceData = values?.Data[0];

        const correctFee =
          fieldName === "Fee"
            ? Number(newValue)
            : Number(serviceData?.Fee) || Number(rowData?.Fee);
        const pureAmount = Number(serviceData?.FinalQuantity) * correctFee;
        const manualPureAmount = Number(rowData?.Quantity1) * correctFee;
        const correctPureAmount = pureAmount ? pureAmount : manualPureAmount;

        const factors = serviceData?.AddElementDetailItems || [];
        const discounts = serviceData?.DiscountItems || [];
        const taxes = serviceData?.TaxItems || [];

        const rowTotalAdditional =
          (serviceData?.ConstructionCost || 0) +
          (serviceData?.SellerProfit || 0) +
          (serviceData?.Commission || 0);

        const legalFundsAmount =
          type === "JEWELRY"
            ? (serviceData?.LegalFunds &&
                (rowTotalAdditional * serviceData?.LegalFundsRate) / 100) ||
              null
            : (serviceData?.LegalFunds &&
                (correctPureAmount * serviceData?.LegalFundsRate) / 100) ||
              null;
        const legalFundsRate =
          (serviceData?.LegalFunds && serviceData?.LegalFundsRate) || null;
        const taxFundsAmount =
          type === "JEWELRY"
            ? (serviceData?.TaxFundsRate &&
                (rowTotalAdditional * serviceData?.TaxFundsRate) / 100) ||
              null
            : (serviceData?.TaxFunds &&
                (correctPureAmount * serviceData?.TaxFundsRate) / 100) ||
              null;
        const taxFundsRate =
          (serviceData?.TaxFunds && serviceData?.TaxFundsRate) || null;

        const { factorItems, factorIds } = calcFactor(
          correctPureAmount,
          factors
        );

        const { discountItems, discountIds } = calcDiscount(
          correctPureAmount,
          discounts,
          factors
        );

        const { taxItems, taxIds } = calcTax(
          correctPureAmount,
          taxes,
          discounts,
          factors,
          rowData?.VATBaseAmount,
          rowTotalAdditional,
          type
        );

        serverData = {
          ...serviceData,
          FinalQuantity: serviceData?.FinalQuantity,
          Fee: correctFee,
          TaxItems: taxItems,
          TaxIds: taxIds,
          DiscountIds: discountIds,
          DiscountItems: discountItems,
          AddElementDetailItems: factorItems,
          AddElementDetailIds: factorIds,
          LegalFundsAmount: legalFundsAmount,
          LegalFundsRate: legalFundsRate,
          TaxFundsAmount: taxFundsAmount,
          TaxFundsRate: taxFundsRate,
        };
      }
    } catch (err) {
      null;
    }

    const finalData = {
      ...clientData,
      ...(serverData || {}),
    };

    return finalData;
  };

  const additionalAction: IAdditionalAction<ISalesInvoiceDetails>[] = [
    {
      label: t("general.tax"),
      icon: "TaxIcon",
      handler: ({ record, index, helpers }) => {
        setDetailConfigModal({ record, index, helpers });
        setDetailTaxModalIsOpen(true);
      },
    },
    {
      label: t("general.discount"),
      icon: "DiscountSignIcon",
      handler: ({ record, index, helpers }) => {
        setDetailConfigModal({ record, index, helpers });
        setDetailDiscountModalIsOpen(true);
      },
    },
    {
      label: t("general.invoiceEtcFactor"),
      icon: "BillListIcon",
      handler: ({ record, index, helpers }) => {
        setDetailConfigModal({ record, index, helpers });
        setDetailEtcFactorModalIsOpen(true);
      },
    },
  ];

  const calculateParameter = (detailsData: ISalesInvoiceDetails[]) => {
    function calculateTotalAmount(rowData: ISalesInvoiceDetails): number {
      if (rowData?.RowState === RowStateEnum.Delete) return 0;
      let pureAmount = 0;
      if (rowData?.FinalQuantity) {
        pureAmount = rowData["FinalQuantity"] * rowData["Fee"] || 0;
      } else {
        pureAmount = rowData["Quantity1"] * rowData["Fee"] || 0;
        rowData["Quantity1"] * rowData["Fee"] || 0;
      }
      const factors = rowData?.["AddElementDetailItems"];
      const { increasingFactorValue, decreasingFactorValue } = calcFactor(
        pureAmount,
        factors
      );

      return pureAmount + increasingFactorValue - decreasingFactorValue;
    }
    function calculateAdditionalTotalAmount(
      rowData: ISalesInvoiceDetails
    ): number {
      if (rowData?.RowState === RowStateEnum.Delete) return 0;

      const additionalTotalPrice =
        rowData?.["ConstructionCost"] +
          rowData?.["SellerProfit"] +
          rowData?.["Commission"] || 0;

      return additionalTotalPrice;
    }
    function calculateDetailIncreasing(rowData: ISalesInvoiceDetails): number {
      if (rowData?.RowState === RowStateEnum.Delete) return 0;
      const pureAmount = rowData?.["FinalQuantity"] * rowData?.["Fee"] || 0;
      const taxes = rowData?.["TaxItems"];
      const discounts = rowData?.["DiscountItems"];
      const factors = rowData?.["AddElementDetailItems"];
      const vat = rowData?.["VATBaseAmount"];

      const rowAdditionalTotal =
        rowData?.["ConstructionCost"] +
          rowData?.["SellerProfit"] +
          rowData?.["Commission"] || 0;

      const { totalTaxValue } = calcTax(
        pureAmount,
        taxes,
        discounts,
        factors,
        vat,
        rowAdditionalTotal,
        type
      );

      const increasingValue2 = rowData?.["LegalFundsAmount"] || 0;
      const increasingValue3 = rowData?.["TaxFundsAmount"] || 0;

      return totalTaxValue + increasingValue2 + increasingValue3;
    }
    function calculateDetailDecreasing(rowData: ISalesInvoiceDetails): number {
      if (rowData?.RowState === RowStateEnum.Delete) return 0;
      const pureAmount = rowData?.["FinalQuantity"] * rowData?.["Fee"] || 0;
      const discounts = rowData?.["DiscountItems"];
      const factors = rowData?.["AddElementDetailItems"];

      const { totalDiscountValue } = calcDiscount(
        pureAmount,
        discounts,
        factors
      );

      return totalDiscountValue;
    }
    function calculateTotalDiscount(rowData: ISalesInvoiceDetails): number {
      if (rowData?.RowState === RowStateEnum.Delete) return 0;
      const pureAmount = rowData?.["FinalQuantity"] * rowData?.["Fee"] || 0;
      const discounts = rowData?.["DiscountItems"];
      const factors = rowData?.["AddElementDetailItems"];

      const { totalDiscountValue } = calcDiscount(
        pureAmount,
        discounts,
        factors
      );

      return totalDiscountValue;
    }
    function calculateTotalRowBeforeDiscount(
      rowData: ISalesInvoiceDetails
    ): number {
      if (rowData?.RowState === RowStateEnum.Delete) return 0;
      const pureAmount = rowData?.["FinalQuantity"] * rowData?.["Fee"] || 0;
      const factors = rowData?.["AddElementDetailItems"];

      const { increasingFactorValue, decreasingFactorValue } = calcFactor(
        pureAmount,
        factors
      );

      const RowBeforeDiscount =
        pureAmount + increasingFactorValue - decreasingFactorValue;

      const rowAdditionalTotal =
        rowData?.["ConstructionCost"] +
          rowData?.["SellerProfit"] +
          rowData?.["Commission"] || 0;

      return RowBeforeDiscount + rowAdditionalTotal;
    }

    let totalDecreasing = 0;
    let totalIncreasing = 0;
    let totalAmount = 0;
    let totalRowBeforeDiscount = 0;
    let additionalTotalAmount = 0;
    let totalVATBaseAmount = 0;
    let totalDiscount = 0;

    for (const rowData of detailsData) {
      additionalTotalAmount += calculateAdditionalTotalAmount(rowData);
      totalAmount += calculateTotalAmount(rowData);
      totalIncreasing += calculateDetailIncreasing(rowData);
      totalDecreasing += calculateDetailDecreasing(rowData);
      totalRowBeforeDiscount += calculateTotalRowBeforeDiscount(rowData);
      totalDiscount += calculateTotalDiscount(rowData);
      totalVATBaseAmount += rowData?.["VATBaseAmount"] || 0;
    }

    setTotalValues({
      detailDecreasing: totalDecreasing,
      detailIncreasing: totalIncreasing,
      totalDetailAmount: totalAmount,
      totalDetailAdditionalAmount: additionalTotalAmount,
      beforeTaxAmount: totalRowBeforeDiscount - totalDiscount,
      vatBaseAmount: totalVATBaseAmount,
    });

    return {
      decreasing: totalDecreasing,
      increasing: totalIncreasing,
      total: totalAmount,
      additional: additionalTotalAmount,
    };
  };

  useEffect(() => {
    if (correctCurrency) {
      if (isEdit) {
        setCurrency(correctCurrency);
      } else {
        setCurrency(null);
      }
    }
  }, [correctCurrency]);

  return {
    // CONSTANTS

    titleKey,
    fieldKey,
    alternateKey,
    detailCaption,
    detailKey,
    detailDragUrl,
    info,
    recordsPerPage,
    currency,

    // UTILS

    calcIndependentValue,
    calculateParameter,
    renderConditionalColumn,
    additionalAction,
    defaultValue,

    // HANDLERS

    handleSettlementAction,
    handlePaginationChange,
    handleAddNew,

    // DATA

    detailsData,
    detailsTotal,
    storedData,
    detailInitial,
    detailRequiredValue,
    pageId,

    // STATE

    headerId,
    setHeaderId,
    pageNumber,
    setPageNumber,
    isShowForm,
    setShowForm,
    sourceId,
    totalValues,
    totalOtherValues,
    setTotalOtherValues,

    // DETAILS

    detailsInitialData,
    setDetailsInitialData,
    columnsConfig,
    setColumnsConfig,

    // MODALS

    settlementModalIsOpen,
    setSettlementModalIsOpen,
    detailTaxModalIsOpen,
    setDetailTaxModalIsOpen,
    detailDiscountModalIsOpen,
    setDetailDiscountModalIsOpen,
    detailConfigModal,
    setDetailConfigModal,
    detailEtcFactorModalIsOpen,
    setDetailEtcFactorModalIsOpen,

    // REFS

    childRef,

    // LOADING

    isLoading,
    triggerIsLoading,
  };
};
