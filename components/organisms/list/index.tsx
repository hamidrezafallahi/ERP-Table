"use client";
import { useEffect, useReducer, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomModal } from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import {
  ExceptionIcon,
  New,
  PhysicalCharacteristicsIcon,
  SettlementIcon,
  TagIcon,
} from "@components/atoms/iconComponents";
import Card from "@components/molecules/card";
import Confirmation from "@components/molecules/confirmation";
import ContactInfo from "@components/molecules/contactInfo";
import { CustomerCredit } from "@components/molecules/customerCredit";
import { CustomerGroupCredit } from "@components/molecules/customerGroupCredit";
import DataGrid from "@components/molecules/dataGrid";
import { ExceptionsModal } from "@components/molecules/exceptionsModal";
import { ExpireDateAccountList } from "@components/molecules/expireDateAccountList";
import GoodExtraInfo from "@components/molecules/goodExtraInfo";
import { GoodPrice } from "@components/molecules/goodPrice";
import { GoodQc } from "@components/molecules/goodQc";
import { GoodSettings } from "@components/molecules/goodSettings";
import GoodVariantValues from "@components/molecules/goodVariantValues";
import { InventoryControl } from "@components/molecules/inventoryControl";
import { InventoryInspection } from "@components/molecules/inventoryInspection";
import { UserReport } from "@components/molecules/managementSystem/reports";
import {
  ChangeInvoiceCurrency,
  ChangeInvoiceCurrencyRate,
  Settlement,
} from "@components/molecules/salesAndPurchase/salesInvoice";
import {
  Education,
  History,
  PhysicalCharacteristicsModal,
  SpecialServices,
  Sponsor,
  TrainingCourse,
  WorkHistory,
} from "@components/molecules/staff";
import { FormulaParameter } from "@components/molecules/staff/formulaParameter";
import { StockWarehouse } from "@components/molecules/stockWarehouse";
import { TagManagement } from "@components/molecules/tag";
import { TaxSettings } from "@components/molecules/taxSettings";
import ListToolbar from "@components/organisms/listToolbar";
import { useDarkMode, useInitializePage } from "@hooks/custom";
import Uploader from "@layout/baseLayout/desktop/actionBar/panelForm/uploader";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation, useGetData } from "@services/base";
import { type IBaseDto, PendingStatusEnum } from "@services/base/type";
import { addSpecificTags } from "@slice/container";
import { addHistory } from "@slice/history";
import { HistoryTypeEnum } from "@slice/history/enum";
import { setPageState, setStatusItemsList, setViewData } from "@slice/pages";
import { PageStateEnum } from "@slice/pages/enum";
import { SystemEnum } from "@type/enum";
import type { IToolbarMenu } from "@type/toolbar";
import {
  findingPageState,
  getColoredIcon,
  showInfoToast,
  showSuccessToast,
} from "@utils/core";

import DynamicModal from "../dynamicModal";
import { GridToolbar } from "../gridToolbar";
import { ActionLabelsEnum } from "./enum";
import type { Action, IProps, IState } from "./type";
import CurrencyConversion from "@components/molecules/currencyConversion";

export default function List<T extends IBaseDto, K>({
  url,
  deleteUrl,
  confirmUrl,
  staticKey,
  staticKeyII,
  rowFieldKey,
  additionalFieldKey,
  recordPerPage,
  formUrl,
  addCaption,
  repoId,
  systemId,
  baseRepoId,
  conditionalActions,
  EditField,
  withoutActivation,
  rangeFilterKey,
  customColumns,
  bodyKey,
  bodyValue,
  renderCustomActions,
  filteringAction,
  isShowChangeStatus = false,
  system,
}: IProps<T, K>) {
  const { mode = "light" } = useDarkMode();
  const t = useTranslations();
  const initializePage = useInitializePage();
  const [toolbarConfig, setToolbarConfig] = useState();
  const [columnsList, setColumnsList] = useState();
  const [recordsPerPage, setRecordsPerPage] = useState(recordPerPage);
  const [selectedId, setSelectedId] = useState(null);
  const [uniqueId, setUniqueId] = useState<string>("");
  const [additionalValue, setAdditionalValue] = useState(null);
  const [attachmentTitle, setAttachmentTitle] = useState(t("general.pictures"));
  const [confirmMode, setConfirmMode] = useState<
    "Delete" | "Confirm" | "createNewEdit"
  >(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { activePage, direction, isFullScreen, match } = useAppSelector(
    (state) => {
      const activePage = state.withPersist.pages.find(
        (item) => item.isActive === true,
      );
      const direction = state.withPersist.config.direction;
      const isFullScreen = state.withPersist.config.fullScreen;
      const match = state.withPersist.config.initMatch;

      return { activePage, direction, isFullScreen, match };
    },
    shallowEqual,
  );

  const toolbarData = activePage?.toolbarData;
  const mobilePerPageCount = 100;

  const {
    data: gridTotal,
    isFetching: totalIsFetching,
    isLoading: totalIsLoading,
  } = useGetData<null, null>({
    url: url,
    body: {
      Filters: {
        FilterInfo: activePage?.viewData?.Filters?.FilterInfo
          ? activePage?.viewData?.Filters?.FilterInfo
          : [],
        ShowOnlyBookmarked: activePage?.viewData?.Filters?.ShowOnlyBookmarked
          ? activePage?.viewData?.Filters?.ShowOnlyBookmarked
          : false,
        TagIdsFilter: activePage?.viewData?.Filters?.TagIdsFilter
          ? activePage?.viewData?.Filters?.TagIdsFilter
          : null,
      },
      OrderInfo: [],
      RepoViewId: activePage?.viewData?.RepoViewId,
      ShowMode: 10,
      ShowTags: activePage?.viewData?.ShowTags
        ? activePage?.viewData?.ShowTags
        : true,
      ShowBookmarked: activePage?.viewData?.ShowBookmarked
        ? activePage?.viewData?.ShowBookmarked
        : true,
      PagingInfo: {
        PageNumber: activePage?.viewData?.PagingInfo?.PageNumber
          ? activePage?.viewData?.PagingInfo?.PageNumber
          : 1,
        PageRecordCount: !match
          ? mobilePerPageCount
          : activePage?.viewData?.PagingInfo?.PageRecordCount
            ? activePage?.viewData?.PagingInfo?.PageRecordCount
            : 10,

        OnlyTotalCount: true,
      },
      FullSearchPhrase: activePage?.viewData?.FullSearchPhrase
        ? activePage?.viewData?.FullSearchPhrase
        : "",

      ...(bodyKey ? { [bodyKey]: Number(bodyValue) } : {}),
    },
    skip: !activePage?.viewData?.RepoViewId || baseRepoId !== activePage.RepoId,
    id: "LIST",
  });
  const {
    data: gridData,
    isFetching: gridIsLoading,
    refetch,
  } = useGetData<T[], K>({
    url: url,
    body: {
      Filters: {
        FilterInfo: activePage?.viewData?.Filters?.FilterInfo
          ? activePage?.viewData?.Filters?.FilterInfo
          : [],
        ShowOnlyBookmarked: activePage?.viewData?.Filters?.ShowOnlyBookmarked
          ? activePage?.viewData?.Filters?.ShowOnlyBookmarked
          : false,
        TagIdsFilter: activePage?.viewData?.Filters?.TagIdsFilter
          ? activePage?.viewData?.Filters?.TagIdsFilter
          : null,
      },
      OrderInfo: activePage?.viewData?.OrderInfo
        ? activePage?.viewData?.OrderInfo
        : [],
      RepoViewId: activePage?.viewData?.RepoViewId,
      ShowMode: 10,
      ShowTags: activePage?.viewData?.ShowTags
        ? activePage?.viewData?.ShowTags
        : true,
      ShowBookmarked: activePage?.viewData?.ShowBookmarked
        ? activePage?.viewData?.ShowBookmarked
        : true,
      PagingInfo: {
        PageNumber: activePage?.viewData?.PagingInfo?.PageNumber
          ? activePage?.viewData?.PagingInfo?.PageNumber
          : 1,
        PageRecordCount: !match
          ? mobilePerPageCount
          : activePage?.viewData?.PagingInfo?.PageRecordCount
            ? activePage?.viewData?.PagingInfo?.PageRecordCount
            : 10,
      },
      FullSearchPhrase: activePage?.viewData?.FullSearchPhrase
        ? activePage?.viewData?.FullSearchPhrase
        : "",
      ...(bodyKey ? { [bodyKey]: Number(bodyValue) } : {}),
    },
    skip: !activePage?.viewData?.RepoViewId || baseRepoId !== activePage.RepoId,
    id: "LIST",
  });

  const refetchGrid = () => {
    refetch();
  };

  useEffect(() => {
    const recordHeight = 40;
    const deviceHeight = window.innerHeight;
    if (isFullScreen) {
      const recordsPerPage = Math.floor((deviceHeight - 140) / recordHeight);
      setRecordsPerPage(recordsPerPage);
      dispatch(
        setViewData({
          ...activePage?.viewData,
          PagingInfo: {
            PageNumber: activePage?.viewData?.PagingInfo?.PageNumber,
            PageRecordCount: recordsPerPage,
          },
        }),
      );
    } else {
      const recordsPerPage = Math.floor((deviceHeight - 240) / recordHeight);
      setRecordsPerPage(recordsPerPage);
      dispatch(
        setViewData({
          ...activePage?.viewData,
          PagingInfo: {
            PageNumber: activePage?.viewData?.PagingInfo?.PageNumber,
            PageRecordCount: recordsPerPage,
          },
        }),
      );
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (toolbarData?.List?.Config) {
      setToolbarConfig(JSON.parse(toolbarData?.List?.Config));
    }
    const repoViewConfig =
      toolbarData?.List?.ListProp &&
      toolbarData?.List?.ListProp?.find(
        (item) => item.Id === activePage?.viewData?.RepoViewId,
      );
    if (repoViewConfig?.Config) {
      let finalColumns;
      const currentColumns = JSON.parse(repoViewConfig?.Config);

      finalColumns = currentColumns;
      if (currentColumns && customColumns) {
        finalColumns = {
          ...currentColumns,
          column: [...currentColumns.column, ...customColumns],
        };
      }
      setColumnsList(finalColumns);
    }
  }, [
    activePage?.viewData?.RepoViewId,
    toolbarData?.List?.Config,
    toolbarData?.List?.ListProp,
  ]);

  const [confirmationItem, { isLoading: confirmationIsLoading }] =
    useCUDDataMutation();
  const dispatch = useDispatch();

  const initialState: IState = {
    actionConfig: null,
    confirmModalIsOpen: false,
    confirmDrawerIsOpen: false,
    dynamicModalIsOpen: false,
    attachmentModalIsOpen: false,
    addTagModalIsOpen: false,
    goodVariantValuesModalIsOpen: false,
    goodExtraInfoModalIsOpen: false,
    goodPriceModalIsOpen: false,
    personContactModalIsOpen: false,
    currencyConversionModalIsOpen: false,
    deleteAccountingDocumentModalIsOpen: false,
    userReportModalIsOpen: false,
    expireDateModalIsOpen: false,
    goodSettingsModalIsOpen: false,
    taxSettingsModalIsOpen: false,
    settlementModalIsOpen: false,
    PhysicalCharacteristicsModalIsOpen: false,
    goodQCModalIsOpen: false,
    stockWarehouseModalIsOpen: false,
    inventoryInspectionModalIsOpen: false,
    inventoryControlModalIsOpen: false,
    trainingCourseModalIsOpen: false,
    educationModalIsOpen: false,
    workHistoryModalIsOpen: false,
    historyModalIsOpen: false,
    sponsorModalIsOpen: false,
    exceptionsModalIsOpen: false,
    specialServicesModalIsOpen: false,
    formulaParameterModalIsOpen: false,
    changeInvoiceCurrencyModalIsOpen: false,
    changeInvoiceCurrencyRateModalIsOpen: false,
    customerCreditModalIsOpen: false,
    customerGroupCreditModalIsOpen: false,
  };

  function reducer(state: IState, action: Action): IState {
    switch (action.type) {
      case "OPEN_CONFIRM_MODAL":
        return { ...state, confirmModalIsOpen: true, actionConfig: null };
      case "CLOSE_CONFIRM_MODAL":
        return { ...state, confirmModalIsOpen: false, actionConfig: null };
      case "OPEN_CREATE_YEAR_PLAN_MODAL":
        return { ...state, confirmModalIsOpen: true, actionConfig: null };
      case "CLOSE_CREATE_YEAR_PLAN_MODAL":
        return { ...state, confirmModalIsOpen: false, actionConfig: null };
      case "OPEN_CREATE_YEAR_PLAN_DRAWER":
        return { ...state, confirmDrawerIsOpen: true, actionConfig: null };
      case "CLOSE_CREATE_YEAR_PLAN_DRAWER":
        return { ...state, confirmDrawerIsOpen: false, actionConfig: null };
      case "OPEN_CONFIRM_DRAWER":
        return { ...state, confirmDrawerIsOpen: true, actionConfig: null };
      case "CLOSE_CONFIRM_DRAWER":
        return { ...state, confirmDrawerIsOpen: false, actionConfig: null };
      case "OPEN_ADD_TAG_MODAL":
        return { ...state, addTagModalIsOpen: true, actionConfig: null };
      case "CLOSE_ADD_TAG_MODAL":
        return { ...state, addTagModalIsOpen: false, actionConfig: null };
      case "OPEN_ATTACHMENT_MODAL":
        return { ...state, attachmentModalIsOpen: true, actionConfig: null };
      case "CLOSE_ATTACHMENT_MODAL":
        return { ...state, attachmentModalIsOpen: false, actionConfig: null };
      case "OPEN_GOOD_VARIANT_VALUES_MODAL":
        return {
          ...state,
          goodVariantValuesModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_GOOD_VARIANT_VALUES_MODAL":
        return {
          ...state,
          goodVariantValuesModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_GOOD_EXTRA_INFO_MODAL":
        return {
          ...state,
          goodExtraInfoModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_GOOD_EXTRA_INFO_MODAL":
        return {
          ...state,
          goodExtraInfoModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_USER_REPORT_MODAL":
        return {
          ...state,
          userReportModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_USER_REPORT_MODAL":
        return {
          ...state,
          userReportModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_GOOD_PRICE_MODAL":
        return {
          ...state,
          goodPriceModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_GOOD_PRICE_MODAL":
        return {
          ...state,
          goodPriceModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_PERSON_CONTACT_MODAL":
        return {
          ...state,
          personContactModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "OPEN_CURRENCY_CONVERSION_MODAL":
        return {
          ...state,
          currencyConversionModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "OPEN_DELETE_ACCOUNTING_DOCUMENT_MODAL":
        return {
          ...state,
          deleteAccountingDocumentModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_DELETE_ACCOUNTING_DOCUMENT_MODAL":
        return {
          ...state,
          deleteAccountingDocumentModalIsOpen: false,
          actionConfig: null,
        };
      case "CLOSE_CURRENCY_CONVERSION_MODAL":
        return {
          ...state,
          currencyConversionModalIsOpen: false,
          actionConfig: null,
        };
      case "CLOSE_PERSON_CONTACT_MODAL":
        return {
          ...state,
          personContactModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_EXPIRE_DATE_ACCOUNT_LIST_MODAL":
        return {
          ...state,
          expireDateModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_EXPIRE_DATE_ACCOUNT_LIST_MODAL":
        return {
          ...state,
          expireDateModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_GOOD_SETTINGS_MODAL":
        return {
          ...state,
          goodSettingsModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_GOOD_SETTINGS_MODAL":
        return {
          ...state,
          goodSettingsModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_TAX_SETTINGS_MODAL":
        return {
          ...state,
          taxSettingsModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_TAX_SETTINGS_MODAL":
        return {
          ...state,
          taxSettingsModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_SETTLEMENT_MODAL":
        return {
          ...state,
          settlementModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_SETTLEMENT_MODAL":
        return {
          ...state,
          settlementModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_PHYSICAL_CHARACTERISTICS_MODAL":
        return {
          ...state,
          PhysicalCharacteristicsModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_PHYSICAL_CHARACTERISTICS_MODAL":
        return {
          ...state,
          PhysicalCharacteristicsModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_GOOD_QC_MODAL":
        return {
          ...state,
          goodQCModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_GOOD_QC_MODAL":
        return {
          ...state,
          goodQCModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_INVENTORY_INSPECTION_MODAL":
        return {
          ...state,
          inventoryInspectionModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_INVENTORY_INSPECTION_MODAL":
        return {
          ...state,
          inventoryInspectionModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_STOCK_WAREHOUSE_MODAL":
        return {
          ...state,
          stockWarehouseModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_STOCK_WAREHOUSE_MODAL":
        return {
          ...state,
          stockWarehouseModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_INVENTORY_CONTROL_MODAL":
        return {
          ...state,
          inventoryControlModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_INVENTORY_CONTROL_MODAL":
        return {
          ...state,
          inventoryControlModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_EXCEPTIONS_MODAL":
        return {
          ...state,
          exceptionsModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_EXCEPTIONS_MODAL":
        return {
          ...state,
          exceptionsModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_TRAINING_COURSE_MODAL":
        return {
          ...state,
          trainingCourseModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_TRAINING_COURSE_MODAL":
        return {
          ...state,
          trainingCourseModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_EDUCATION_MODAL":
        return {
          ...state,
          educationModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_EDUCATION_MODAL":
        return {
          ...state,
          educationModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_WORK_HISTORY_MODAL":
        return {
          ...state,
          workHistoryModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_WORK_HISTORY_MODAL":
        return {
          ...state,
          workHistoryModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_HISTORY_MODAL":
        return {
          ...state,
          historyModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_HISTORY_MODAL":
        return {
          ...state,
          historyModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_SPONSOR_MODAL":
        return {
          ...state,
          sponsorModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_SPONSOR_MODAL":
        return {
          ...state,
          sponsorModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_SPECIAL_SERVICES_MODAL":
        return {
          ...state,
          specialServicesModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_SPECIAL_SERVICES_MODAL":
        return {
          ...state,
          specialServicesModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_FORMULA_PARAMETER_MODAL":
        return {
          ...state,
          formulaParameterModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_FORMULA_PARAMETER_MODAL":
        return {
          ...state,
          formulaParameterModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_DYNAMIC_MODAL":
        return {
          ...state,
          dynamicModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_DYNAMIC_MODAL":
        return {
          ...state,
          dynamicModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_CHANGE_CURRENCY_MODAL":
        return {
          ...state,
          changeInvoiceCurrencyModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_CHANGE_CURRENCY_MODAL":
        return {
          ...state,
          changeInvoiceCurrencyModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_CHANGE_CURRENCY_RATE_MODAL":
        return {
          ...state,
          changeInvoiceCurrencyRateModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_CHANGE_CURRENCY_RATE_MODAL":
        return {
          ...state,
          changeInvoiceCurrencyRateModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_CUSTOMER_CREDIT_MODAL":
        return {
          ...state,
          customerCreditModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_CUSTOMER_CREDIT_MODAL":
        return {
          ...state,
          customerCreditModalIsOpen: false,
          actionConfig: null,
        };
      case "OPEN_CUSTOMER_GROUP_CREDIT_MODAL":
        return {
          ...state,
          customerGroupCreditModalIsOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_CUSTOMER_GROUP_CREDIT_MODAL":
        return {
          ...state,
          customerGroupCreditModalIsOpen: false,
          actionConfig: null,
        };

      default:
        return state;
    }
  }

  const [state, dispatchState] = useReducer(reducer, initialState);

  const prevGridDataRef = useRef(gridData);

  useEffect(() => {
    if (activePage && gridData?.Data?.length < 1) {
      const pageNumberCount = Number(
        activePage?.viewData?.PagingInfo?.PageNumber,
      );
      const pageRecordCount = Number(
        activePage?.viewData?.PagingInfo?.PageRecordCount,
      );
      if (pageNumberCount > 1) {
        dispatch(
          setViewData({
            ...activePage?.viewData,
            PagingInfo: {
              PageNumber: pageNumberCount ? pageNumberCount - 1 : 1,
              PageRecordCount: pageRecordCount ? pageRecordCount : 10,
            },
          }),
        );
      }
    }

    if (prevGridDataRef.current !== gridData) {
      if (gridData?.Data?.length > 0) {
        gridData.Data.map((item) =>
          dispatch(
            addSpecificTags({
              RepoId: repoId,
              RefId: Number(item[rowFieldKey]),
              tags: item?.TagsInfo,
            }),
          ),
        );
      }
    }

    prevGridDataRef.current = gridData;
  }, [gridData]);

  const handleAction = (
    action: IToolbarMenu,
    id: number | null,
    additionalId: number | null,
    PendingStatusId: number | null,
    formViewId: number | null,
    correctUniqueId?: string | null,
  ) => {
    const deletedItems = activePage?.viewData?.deletedItems;
    const isDeleted = deletedItems?.find((item) => item === id);

    setSelectedId(id);
    setUniqueId(correctUniqueId);
    additionalFieldKey && additionalId && setAdditionalValue(additionalId);
    const correctData: any = gridData?.Data?.find(
      (item) => item[rowFieldKey] === id,
    );
    const voucherId = (
      gridData?.Data?.find((item) => item[rowFieldKey] === selectedId) as any
    )?.VoucherHeaderId;

    if (isDeleted) {
      showInfoToast(t("toast.needReload"));
    } else {
      try {
        switch (action.MenuDesc) {
          case ActionLabelsEnum.Edit as string:
            initializePage({
              config: {
                RepoId: repoId,
                SystemId: systemId,
                url: `${formUrl}?id=${id}`,
                pageState: findingPageState(PendingStatusId),
                originalPageState: findingPageState(PendingStatusId),
                Id: Number(id),
                listPageId: activePage.pageId,
                Key: Number(id),
                selectedView: formViewId ? formViewId : null,
                data: activePage.data,
                returnPageId: activePage.pageId,
              },
            });
            break;
          case ActionLabelsEnum.RelatedAccountingDocument as string:
            console.log(voucherId, "voucherId");

            // initializePage({
            //   config: {
            //     RepoId: repoId,
            //     SystemId: systemId,
            //     url: `acc/voucher?id=${voucherId}`,
            //     pageState: PageStateEnum.Opened,
            //     originalPageState: PageStateEnum.Opened,
            //     Id: Number(voucherId),
            //     listPageId: activePage.pageId,
            //     Key: Number(voucherId),
            //     selectedView: formViewId ? formViewId : null,
            //     data: activePage.data,
            //     returnPageId: activePage.pageId,
            //   },
            // });
            break;
          case ActionLabelsEnum.Show as string:
            initializePage({
              config: {
                RepoId: repoId,
                SystemId: systemId,
                url: `${formUrl}?id=${id}`,
                pageState: findingPageState(PendingStatusId),
                originalPageState: findingPageState(PendingStatusId),
                Id: Number(id),
                listPageId: activePage.pageId,
                Key: Number(id),
                selectedView: formViewId ? formViewId : null,
                data: activePage.data,
              },
            });

            break;

          case ActionLabelsEnum.Design as string:
            initializePage({
              config: {
                RepoId: Math.floor(Math.random() * 1000),
                SystemId: systemId,
                url: `report/design?id=${id}&type=${correctData?.Type}`,
                pageState: findingPageState(PendingStatusId),
                originalPageState: findingPageState(PendingStatusId),
                Id: Number(id),
                listPageId: activePage.pageId,
                Key: Number(id),
              },
            });

            break;
          case ActionLabelsEnum.Access as string:
            initializePage({
              config: {
                RepoId: repoId,
                SystemId: SystemEnum.inv,
                url: `${action.WebLink}?id=${id}`,
                pageState: findingPageState(PendingStatusId),
                originalPageState: findingPageState(PendingStatusId),
                Id: Number(id),
                listPageId: activePage.pageId,
                Key: Number(id),
              },
            });
            break;
          case ActionLabelsEnum.Delete as string:
            setConfirmMode("Delete");
            if (match) {
              dispatchState({ type: "OPEN_CONFIRM_MODAL" });
            } else {
              dispatchState({ type: "OPEN_CONFIRM_DRAWER" });
            }
            break;
          case ActionLabelsEnum.CreateYearPlan as string:
            setConfirmMode("createNewEdit");
            if (match) {
              dispatchState({ type: "OPEN_CREATE_YEAR_PLAN_MODAL" });
            } else {
              dispatchState({ type: "OPEN_CREATE_YEAR_PLAN_DRAWER" });
            }
            break;
          case ActionLabelsEnum.Confirm1 as string:
          case ActionLabelsEnum.Confirm2 as string:
            setConfirmMode("Confirm");
            if (match) {
              dispatchState({ type: "OPEN_CONFIRM_MODAL" });
            } else {
              dispatchState({ type: "OPEN_CONFIRM_DRAWER" });
            }
            break;
          case ActionLabelsEnum.Attachment as string:
            dispatchState({ type: "OPEN_ATTACHMENT_MODAL" });
            break;
          case ActionLabelsEnum.AddTag as string:
            dispatchState({ type: "OPEN_ADD_TAG_MODAL" });
            break;
          case ActionLabelsEnum.GoodVariantValues as string:
            dispatchState({
              type: "OPEN_GOOD_VARIANT_VALUES_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.GoodExtraInfo as string:
            dispatchState({
              type: "OPEN_GOOD_EXTRA_INFO_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.UserReport as string:
            dispatchState({
              type: "OPEN_USER_REPORT_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.GoodPrice as string:
            dispatchState({
              type: "OPEN_GOOD_PRICE_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.ExpireDate as string:
            dispatchState({
              type: "OPEN_EXPIRE_DATE_ACCOUNT_LIST_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.PersonContact as string:
            dispatchState({
              type: "OPEN_PERSON_CONTACT_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.CurrencyConversion as string:
            dispatchState({
              type: "OPEN_CURRENCY_CONVERSION_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.DeleteAccountingDocument as string:
            dispatchState({
              type: "OPEN_DELETE_ACCOUNTING_DOCUMENT_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.TaxSettings as string:
            dispatchState({
              type: "OPEN_TAX_SETTINGS_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.GoodSettings as string:
            dispatchState({
              type: "OPEN_GOOD_SETTINGS_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.Settlement as string:
            dispatchState({
              type: "OPEN_SETTLEMENT_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.PhysicalCharacteristics as string:
            dispatchState({
              type: "OPEN_PHYSICAL_CHARACTERISTICS_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.GoodQc as string:
            dispatchState({
              type: "OPEN_GOOD_QC_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.Inspection as string:
            dispatchState({
              type: "OPEN_INVENTORY_INSPECTION_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.StockWarehouse as string:
            dispatchState({
              type: "OPEN_STOCK_WAREHOUSE_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.InventoryControl as string:
            dispatchState({
              type: "OPEN_INVENTORY_CONTROL_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.Exceptions as string:
            dispatchState({
              type: "OPEN_EXCEPTIONS_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.YearPlan as string:
            initializePage({
              config: {
                RepoId: repoId,
                SystemId: systemId,
                url: `${formUrl}?id=${id}`,
                pageState: findingPageState(PendingStatusId),
                originalPageState: findingPageState(PendingStatusId),
                Id: Number(id),
                listPageId: activePage.pageId,
                Key: Number(id),
                selectedView: formViewId ? formViewId : null,
              },
            });

            break;
          case ActionLabelsEnum.TrainingCourse as string:
            dispatchState({
              type: "OPEN_TRAINING_COURSE_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.Education as string:
            dispatchState({
              type: "OPEN_EDUCATION_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.WorkHistory as string:
            dispatchState({
              type: "OPEN_WORK_HISTORY_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.History as string:
            dispatchState({
              type: "OPEN_HISTORY_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.Sponsor as string:
            dispatchState({
              type: "OPEN_SPONSOR_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.SpecialServices as string:
            dispatchState({
              type: "OPEN_SPECIAL_SERVICES_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.FormulaParameter as string:
            dispatchState({
              type: "OPEN_FORMULA_PARAMETER_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.ChangeInvoiceCurrency as string:
            dispatchState({
              type: "OPEN_CHANGE_CURRENCY_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.ChangeInvoiceCurrencyRate as string:
            dispatchState({
              type: "OPEN_CHANGE_CURRENCY_RATE_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.CustomerCredit as string:
            dispatchState({
              type: "OPEN_CUSTOMER_CREDIT_MODAL",
              payload: action,
            });
            break;
          case ActionLabelsEnum.CustomerGroupCredit as string:
            dispatchState({
              type: "OPEN_CUSTOMER_GROUP_CREDIT_MODAL",
              payload: action,
            });
            break;
          default:
            dispatchState({ type: "OPEN_DYNAMIC_MODAL", payload: action });
            break;
        }
      } catch (error) {
        null;
      }
    }
  };

  function transformKey(key: string): string {
    return key.replace(/List$/, "");
  }

  const handleConfirmation = async (
    PendingStatusId?: number | null,
    formViewId?: number | null,
  ) => {
    const pageName = transformKey(activePage?.caption);

    const correctItem = gridData?.Data?.find(
      (item) => item[rowFieldKey] === selectedId,
    );
    const nameI = correctItem?.[staticKey];
    const nameII = staticKeyII ? ` - ${correctItem?.[staticKeyII]}` : "";
    const name = `${nameI} ${nameII}`;
    try {
      const confirmationResult = await confirmationItem({
        url:
          confirmMode === "Delete"
            ? deleteUrl
            : confirmMode === "Confirm"
              ? confirmUrl
              : confirmMode === "createNewEdit"
                ? "api/prd/insert/yearPlan/updateVersion"
                : null,
        body: { Id: selectedId },
      }).unwrap();

      if (confirmationResult.Result === "Pending") {
        additionalFieldKey && setAdditionalValue(null);

        if (state.confirmDrawerIsOpen) {
          dispatchState({ type: "CLOSE_CONFIRM_DRAWER" });
        }
        if (state.confirmModalIsOpen) {
          dispatchState({ type: "CLOSE_CONFIRM_MODAL" });
        }
        const prevDeletedItems = activePage?.viewData?.deletedItems;
        dispatch(
          setViewData({
            ...activePage?.viewData,
            deletedItems: [...prevDeletedItems, selectedId],
          }),
        );
        dispatch(
          setPageState({
            ...activePage,
            pageState: PageStateEnum.NeedReload,
          }),
        );
        dispatch(
          setStatusItemsList({
            RepoId: Number(repoId),
            items: {
              id: selectedId,
              status: PendingStatusEnum.Pending3,
            },
          }),
        );
        dispatch(
          addHistory({
            key: selectedId,
            initConfig: null,
            type: HistoryTypeEnum.Delete,
            pageName: pageName,
            name: name,
            pageIcon: activePage?.icon,
          }),
        );
        showInfoToast(t("toast.Pending"));
        setSelectedId(null);
        setUniqueId("");
      } else if (confirmationResult.Result === "Success") {
        if (confirmMode !== "Delete") {
          showSuccessToast("", t("toast.successTitle"), 500);
          setSelectedId(null);
          setUniqueId("");
          additionalFieldKey && setAdditionalValue(null);

          if (state.confirmDrawerIsOpen) {
            dispatchState({ type: "CLOSE_CONFIRM_DRAWER" });
          }
          if (state.confirmModalIsOpen) {
            dispatchState({ type: "CLOSE_CONFIRM_MODAL" });
          }
          dispatch(
            setPageState({
              ...activePage,
              pageState: PageStateEnum.NeedReload,
            }),
          );

          dispatch(
            addHistory({
              key: selectedId,
              initConfig: null,
              type: HistoryTypeEnum.Delete,
              pageName: pageName,
              name: name,
              pageIcon: activePage?.icon,
            }),
          );
        }
        if (confirmMode === "createNewEdit") {
          const pageState = findingPageState(PendingStatusId);
          const newId = confirmationResult.Key ?? selectedId;
          initializePage({
            config: {
              RepoId: repoId,
              SystemId: systemId,
              url: `${formUrl}?id=${newId}`,
              pageState: pageState,
              originalPageState: pageState,
              Id: Number(selectedId),
              listPageId: activePage.pageId,
              Key: Number(selectedId),
              selectedView: formViewId ? formViewId : null,
              data: {
                ...activePage.data,
                ConfirmMode: confirmMode,
              },
            },
          });
        }
        if (confirmationResult.DeleteResults[0].IsDelete === true) {
          additionalFieldKey && setAdditionalValue(null);
          dispatch(
            addHistory({
              key: selectedId,
              initConfig: null,
              type: HistoryTypeEnum.Delete,
              pageName: pageName,
              name: name,
              pageIcon: activePage?.icon,
            }),
          );
          if (state.confirmDrawerIsOpen) {
            dispatchState({ type: "CLOSE_CONFIRM_DRAWER" });
          }
          if (state.confirmModalIsOpen) {
            dispatchState({ type: "CLOSE_CONFIRM_MODAL" });
          }
          dispatch(
            setPageState({
              ...activePage,
              pageState: PageStateEnum.NeedReload,
            }),
          );
          const prevDeletedItems = activePage?.viewData?.deletedItems;
          dispatch(
            setViewData({
              ...activePage?.viewData,
              deletedItems: [...prevDeletedItems, selectedId],
            }),
          );
          showSuccessToast("", t("toast.successTitle"), 500);
          setSelectedId(null);
          setUniqueId("");
        }
      } else {
        if (state.confirmDrawerIsOpen) {
          dispatchState({ type: "CLOSE_CONFIRM_DRAWER" });
        }
        if (state.confirmModalIsOpen) {
          dispatchState({ type: "CLOSE_CONFIRM_MODAL" });
        }
      }
    } catch (error) {
      null;
    }
  };

  const handleAddNew = () => {
    initializePage({
      config: {
        RepoId: repoId,
        SystemId: systemId,
        url: formUrl,
        data: activePage?.data,
      },
    });
  };

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tableRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "t") {
        e.preventDefault();
        tableRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {toolbarData && (
        <>
          <div className={`${match ? "relative" : ""} w-full`}>
            <div
              className={
                match
                  ? `absolute -top-[70px] ${
                      direction == "rtl" ? "-left-[10px]" : "-right-[10px]"
                    } `
                  : ""
              }
            >
              <ListToolbar
                formUrl={formUrl}
                addCaption={addCaption}
                deleteUrl={deleteUrl}
                confirmUrl={confirmUrl}
                toolbarData={toolbarData}
                repoId={repoId}
                systemId={systemId}
                isSelectMode={isSelectMode}
                gridData={gridData}
                rowFieldKey={rowFieldKey as string}
                staticKey={staticKey as string}
                staticKeyII={staticKeyII as string}
                url={url}
                renderCustomActions={renderCustomActions}
              />
            </div>
            <GridToolbar
              viewData={activePage?.viewData}
              config={toolbarConfig}
              rowFieldKey={rowFieldKey as string}
              rangeFilterKey={rangeFilterKey}
            />
          </div>

          {!match ? (
            <Card
              staticKey={staticKey as string}
              staticKeyII={staticKeyII as string}
              gridData={gridData}
              columnsList={columnsList}
              actions={toolbarData?.GridMenu}
              onActionClick={handleAction}
              rowFieldKey={rowFieldKey as string}
              additionalFieldKey={additionalFieldKey}
              conditionalActions={conditionalActions as any}
              isSelectMode={isSelectMode}
              setIsSelectMode={setIsSelectMode}
              viewData={activePage?.viewData}
              mobilePerPageCount={mobilePerPageCount}
              direction={direction}
              totalCount={gridTotal?.TotalCount}
              loading={gridIsLoading}
              withoutActivation={withoutActivation}
              filteringAction={filteringAction}
              isShowChangeStatus={isShowChangeStatus}
              system={system}
            />
          ) : (
            <DataGrid
              columnsList={columnsList}
              viewData={activePage?.viewData}
              totalCount={gridTotal?.TotalCount}
              totalIsLoading={
                totalIsLoading ? true : totalIsFetching ? true : false
              }
              data={gridData?.Data}
              actions={toolbarData?.GridMenu}
              loading={gridIsLoading}
              onActionClick={handleAction}
              rowFieldKey={rowFieldKey}
              additionalFieldKey={additionalFieldKey}
              recordPerPage={recordsPerPage}
              conditionalActions={conditionalActions}
              filteringAction={filteringAction}
              EditField={EditField}
              formUrl={formUrl}
              ref={tableRef}
              withoutActivation={withoutActivation}
              isShowChangeStatus={isShowChangeStatus}
              system={system}
            />
          )}

          {!match && (
            <div className="bottom-9 absolute flex justify-end bg-opacity-0 mt-2 px-6 w-full">
              <div
                className="flex justify-center items-center bg-black-black8 p-[12px] border-1 border-black-black95 rounded-full h-full text-white text-xs fullShadow"
                onClick={handleAddNew}
              >
                <New config={{ width: 25, height: 25, stroke: "#fff" }} />
              </div>
            </div>
          )}

          {state.confirmModalIsOpen && (
            <CustomModal
              width={300}
              centered
              disableTitle
              closeModal={() => dispatchState({ type: "CLOSE_CONFIRM_MODAL" })}
              isModalOpen={state.confirmModalIsOpen}
              content={
                <Confirmation
                  itemsToConfirm={selectedId}
                  mode={confirmMode}
                  onLoading={confirmationIsLoading}
                  onCancel={() =>
                    dispatchState({ type: "CLOSE_CONFIRM_MODAL" })
                  }
                  onConfirm={handleConfirmation}
                />
              }
            />
          )}

          <CustomDrawer
            isOpen={state.confirmDrawerIsOpen}
            onClose={() => dispatchState({ type: "CLOSE_CONFIRM_DRAWER" })}
            content={
              <Confirmation
                itemsToConfirm={selectedId}
                mode={confirmMode}
                onLoading={confirmationIsLoading}
                onCancel={() => dispatchState({ type: "CLOSE_CONFIRM_DRAWER" })}
                onConfirm={handleConfirmation}
              />
            }
          />

          {state.dynamicModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] h-full" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() => dispatchState({ type: "CLOSE_DYNAMIC_MODAL" })}
              isModalOpen={state.dynamicModalIsOpen}
              content={
                <>
                  {state.actionConfig.Config ? (
                    <DynamicModal
                      id={selectedId}
                      sourceKey={rowFieldKey as string}
                      additionalId={additionalValue}
                      additionalFieldKey={additionalFieldKey}
                      config={JSON.parse(state.actionConfig.Config)}
                    />
                  ) : (
                    <>کانفیگ این مدال وجود ندارد</>
                  )}
                </>
              }
            />
          )}
          {state.goodVariantValuesModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] h-[470px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_GOOD_VARIANT_VALUES_MODAL" })
              }
              isModalOpen={state.goodVariantValuesModalIsOpen}
              content={
                <GoodVariantValues
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                />
              }
            />
          )}
          {state.goodExtraInfoModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "!w-[520px] h-[470px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_GOOD_EXTRA_INFO_MODAL" })
              }
              isModalOpen={state.goodExtraInfoModalIsOpen}
              content={
                <GoodExtraInfo
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                />
              }
            />
          )}
          {state.userReportModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] h-[470px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_USER_REPORT_MODAL" })
              }
              isModalOpen={state.userReportModalIsOpen}
              content={
                <UserReport id={selectedId} sourceKey={rowFieldKey as string} />
              }
            />
          )}
          {state.goodPriceModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] h-[200px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_GOOD_PRICE_MODAL" })
              }
              isModalOpen={state.goodPriceModalIsOpen}
              content={
                <GoodPrice
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_GOOD_PRICE_MODAL" })
                  }
                />
              }
            />
          )}
          {state.personContactModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] " : ""}`}
              headerName={state.actionConfig.MenuDesc}
              className="top-[5vh] bottom-[15vh] h-[80dvh]"
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_PERSON_CONTACT_MODAL" })
              }
              isModalOpen={state.personContactModalIsOpen}
              content={
                <ContactInfo
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                />
              }
            />
          )}
          {state.currencyConversionModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] " : ""}`}
              headerName={state.actionConfig.MenuDesc}
              className="top-[5vh] bottom-[15vh] h-[80dvh]"
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_CURRENCY_CONVERSION_MODAL" })
              }
              isModalOpen={state.currencyConversionModalIsOpen}
              content={
                <CurrencyConversion
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  rowId={
                    (
                      gridData?.Data?.find(
                        (item) => item[rowFieldKey] === selectedId,
                      ) as any
                    )?.CostConversionId
                  }
                  voucherNumber={
                    (
                      gridData?.Data?.find(
                        (item) => item[rowFieldKey] === selectedId,
                      ) as any
                    )?.VoucherNumber
                  }
                  closeModal={() =>
                    dispatchState({ type: "CLOSE_CURRENCY_CONVERSION_MODAL" })
                  }
                />
              }
            />
          )}
          {state.deleteAccountingDocumentModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] " : ""}`}
              headerName={state.actionConfig.MenuDesc}
              className="top-[5vh] bottom-[15vh] h-[80dvh]"
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({
                  type: "CLOSE_DELETE_ACCOUNTING_DOCUMENT_MODAL",
                })
              }
              isModalOpen={state.deleteAccountingDocumentModalIsOpen}
              content={
                <CurrencyConversion
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  rowId={
                    (
                      gridData?.Data?.find(
                        (item) => item[rowFieldKey] === selectedId,
                      ) as any
                    )?.CostConversionId
                  }
                  mode="delete"
                  closeModal={() =>
                    dispatchState({
                      type: "CLOSE_DELETE_ACCOUNTING_DOCUMENT_MODAL",
                    })
                  }
                />
              }
            />
          )}
          {state.attachmentModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "!min-w-max h-full" : ""}`}
              headerName={attachmentTitle}
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_ATTACHMENT_MODAL" })
              }
              isModalOpen={state.attachmentModalIsOpen}
              content={
                <Uploader
                  onlyAcceptImage
                  RefId={selectedId}
                  setModalTitle={setAttachmentTitle}
                  RepoId={repoId}
                />
              }
            />
          )}
          {state.addTagModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px]" : ""}`}
              headerName={t("modal.tags")}
              headerIcon={match ? <TagIcon /> : null}
              closeModal={() => dispatchState({ type: "CLOSE_ADD_TAG_MODAL" })}
              isModalOpen={state.addTagModalIsOpen}
              content={
                <div className={`${match ? "" : "h-full"} p-2 `}>
                  <TagManagement refIds={[selectedId]} />
                </div>
              }
            />
          )}
          {state.expireDateModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] h-[200px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_EXPIRE_DATE_ACCOUNT_LIST_MODAL" })
              }
              isModalOpen={state.expireDateModalIsOpen}
              content={
                <ExpireDateAccountList
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() => {
                    dispatchState({
                      type: "CLOSE_EXPIRE_DATE_ACCOUNT_LIST_MODAL",
                    });
                    refetchGrid();
                  }}
                />
              }
            />
          )}
          {state.taxSettingsModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[540px] h-[300px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_TAX_SETTINGS_MODAL" })
              }
              isModalOpen={state.taxSettingsModalIsOpen}
              content={
                <TaxSettings
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_TAX_SETTINGS_MODAL" })
                  }
                />
              }
            />
          )}
          {state.goodSettingsModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] !h-[500px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_GOOD_SETTINGS_MODAL" })
              }
              isModalOpen={state.goodSettingsModalIsOpen}
              content={
                <GoodSettings
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_GOOD_SETTINGS_MODAL" })
                  }
                />
              }
            />
          )}
          {state.settlementModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "!w-[750px] h-full" : ""}`}
              headerName={t("general.invoiceSettlement")}
              headerIcon={match ? <SettlementIcon /> : null}
              closeModal={() =>
                dispatchState({ type: "CLOSE_SETTLEMENT_MODAL" })
              }
              isModalOpen={state.settlementModalIsOpen}
              content={<Settlement id={selectedId} />}
            />
          )}
          {state.PhysicalCharacteristicsModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[800px] h-[550px]" : ""}`}
              headerName={t("general.physicalCharacteristics")}
              headerIcon={match ? <PhysicalCharacteristicsIcon /> : null}
              closeModal={() =>
                dispatchState({ type: "CLOSE_PHYSICAL_CHARACTERISTICS_MODAL" })
              }
              isModalOpen={state.PhysicalCharacteristicsModalIsOpen}
              content={
                <PhysicalCharacteristicsModal
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() =>
                    dispatchState({
                      type: "CLOSE_PHYSICAL_CHARACTERISTICS_MODAL",
                    })
                  }
                />
              }
            />
          )}
          {state.exceptionsModalIsOpen && (
            <CustomModal
              contentClassName={` lg:w-[800px] h-[550px] `}
              headerName={t("general.exceptions")}
              headerIcon={match ? <ExceptionIcon /> : null}
              closeModal={() =>
                dispatchState({ type: "CLOSE_EXCEPTIONS_MODAL" })
              }
              isModalOpen={state.exceptionsModalIsOpen}
              content={
                <ExceptionsModal
                  id={selectedId}
                  rowData={
                    gridData?.Data?.find(
                      (item) => item[rowFieldKey] === selectedId,
                    ) as any
                  }
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_EXCEPTIONS_MODAL" })
                  }
                />
              }
            />
          )}
          {state.goodQCModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "!w-[620px] h-[470px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() => dispatchState({ type: "CLOSE_GOOD_QC_MODAL" })}
              isModalOpen={state.goodQCModalIsOpen}
              content={
                <GoodQc id={selectedId} sourceKey={rowFieldKey as string} />
              }
            />
          )}
          {state.stockWarehouseModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "!w-[720px] h-[520px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_STOCK_WAREHOUSE_MODAL" })
              }
              isModalOpen={state.stockWarehouseModalIsOpen}
              content={
                <StockWarehouse
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                />
              }
            />
          )}
          {state.inventoryInspectionModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[620px] !h-[500px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )?.[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_INVENTORY_INSPECTION_MODAL" })
              }
              isModalOpen={state.inventoryInspectionModalIsOpen}
              content={
                <InventoryInspection
                  uniqueId={uniqueId}
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_INVENTORY_INSPECTION_MODAL" })
                  }
                />
              }
            />
          )}
          {state.inventoryControlModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] h-[280px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_INVENTORY_CONTROL_MODAL" })
              }
              isModalOpen={state.inventoryControlModalIsOpen}
              content={
                <InventoryControl
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_INVENTORY_CONTROL_MODAL" })
                  }
                />
              }
            />
          )}
          {state.trainingCourseModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[800px] h-[550px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_TRAINING_COURSE_MODAL" })
              }
              isModalOpen={state.trainingCourseModalIsOpen}
              content={<TrainingCourse id={selectedId} />}
            />
          )}
          {state.educationModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[800px] h-[550px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_EDUCATION_MODAL" })
              }
              isModalOpen={state.educationModalIsOpen}
              content={<Education id={selectedId} />}
            />
          )}
          {state.workHistoryModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[800px] h-[550px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_WORK_HISTORY_MODAL" })
              }
              isModalOpen={state.workHistoryModalIsOpen}
              content={<WorkHistory id={selectedId} />}
            />
          )}

          {state.historyModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[800px] h-[550px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() => dispatchState({ type: "CLOSE_HISTORY_MODAL" })}
              isModalOpen={state.historyModalIsOpen}
              content={<History id={selectedId} />}
            />
          )}
          {state.sponsorModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[800px] h-[550px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() => dispatchState({ type: "CLOSE_SPONSOR_MODAL" })}
              isModalOpen={state.sponsorModalIsOpen}
              content={<Sponsor id={selectedId} />}
            />
          )}
          {state.specialServicesModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[800px] h-[550px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_SPECIAL_SERVICES_MODAL" })
              }
              isModalOpen={state.specialServicesModalIsOpen}
              content={<SpecialServices id={selectedId} />}
            />
          )}
          {state.formulaParameterModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "!w-[900px] !h-[450px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_FORMULA_PARAMETER_MODAL" })
              }
              isModalOpen={state.formulaParameterModalIsOpen}
              content={<FormulaParameter id={selectedId} />}
            />
          )}
          {state.changeInvoiceCurrencyModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] h-[200px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_CHANGE_CURRENCY_MODAL" })
              }
              isModalOpen={state.changeInvoiceCurrencyModalIsOpen}
              content={
                <ChangeInvoiceCurrency
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_CHANGE_CURRENCY_MODAL" })
                  }
                />
              }
            />
          )}
          {state.changeInvoiceCurrencyRateModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[520px] h-[200px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_CHANGE_CURRENCY_RATE_MODAL" })
              }
              isModalOpen={state.changeInvoiceCurrencyRateModalIsOpen}
              content={
                <ChangeInvoiceCurrencyRate
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_CHANGE_CURRENCY_RATE_MODAL" })
                  }
                />
              }
            />
          )}
          {state.customerCreditModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[540px] h-[220px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_CUSTOMER_CREDIT_MODAL" })
              }
              isModalOpen={state.customerCreditModalIsOpen}
              content={
                <CustomerCredit
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_CUSTOMER_CREDIT_MODAL" })
                  }
                />
              }
            />
          )}
          {state.customerGroupCreditModalIsOpen && (
            <CustomModal
              contentClassName={`${match ? "w-[540px] h-[220px]" : ""}`}
              headerName={state.actionConfig.MenuDesc}
              headerIcon={
                match && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )
              }
              headerDescription={`${
                gridData?.Data?.find(
                  (item) => item[rowFieldKey] === selectedId,
                )[staticKey]
              }
              `}
              closeModal={() =>
                dispatchState({ type: "CLOSE_CUSTOMER_GROUP_CREDIT_MODAL" })
              }
              isModalOpen={state.customerGroupCreditModalIsOpen}
              content={
                <CustomerGroupCredit
                  id={selectedId}
                  sourceKey={rowFieldKey as string}
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_CUSTOMER_GROUP_CREDIT_MODAL" })
                  }
                />
              }
            />
          )}
        </>
      )}
    </div>
  );
}
