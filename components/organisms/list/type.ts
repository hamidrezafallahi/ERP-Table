import { ReactNode } from "react";

import type { IToolbarMenu } from "@type/toolbar";

export interface IProps<T, K> {
    url: string;
    deleteUrl?: string;

    confirmUrl?: string;
    staticKey: keyof T;
    filterKey: string;
    bodyKey: string;
    bodyValue: string;
    staticKeyII: keyof T;
    rowFieldKey: keyof T;
    additionalFieldKey?: string;
    recordPerPage: number;
    formUrl?: string;
    addCaption?: string;
    repoId?: number;
    systemId?: number;
    baseRepoId?: number;
    conditionalActions?: {
        conditionalProperty: keyof T;
        conditionallyAction?: string;
        opposite?: boolean;
    }[];
    EditField?: string;
    withoutActivation?: boolean;
    rangeFilterKey?: string | null;
    customColumns?: any;
    renderCustomActions?: () => ReactNode;
    filteringAction?: (actions: IToolbarMenu[], rowData: T) => IToolbarMenu[];
    isShowChangeStatus?: boolean;
    system?: string;
}

export interface IState {
    actionConfig: IToolbarMenu | any;
    confirmModalIsOpen: boolean;
    confirmDrawerIsOpen: boolean;
    dynamicModalIsOpen: boolean;
    addTagModalIsOpen: boolean;
    attachmentModalIsOpen: boolean;
    goodVariantValuesModalIsOpen: boolean;
    goodExtraInfoModalIsOpen: boolean;
    userReportModalIsOpen: boolean;
    goodPriceModalIsOpen: boolean;
    expireDateModalIsOpen: boolean;
    personContactModalIsOpen: boolean;
    taxSettingsModalIsOpen: boolean;
    goodSettingsModalIsOpen: boolean;
    settlementModalIsOpen: boolean;
    PhysicalCharacteristicsModalIsOpen: boolean;
    goodQCModalIsOpen: boolean;
    stockWarehouseModalIsOpen: boolean;
    inventoryInspectionModalIsOpen: boolean;
    inventoryControlModalIsOpen: boolean;
    trainingCourseModalIsOpen: boolean;
    educationModalIsOpen: boolean;
    workHistoryModalIsOpen: boolean;
    historyModalIsOpen: boolean;
    sponsorModalIsOpen: boolean;
    exceptionsModalIsOpen: boolean;
    specialServicesModalIsOpen: boolean;
    formulaParameterModalIsOpen: boolean;
    changeInvoiceCurrencyModalIsOpen: boolean;
    changeInvoiceCurrencyRateModalIsOpen: boolean;
    customerCreditModalIsOpen: boolean;
    customerGroupCreditModalIsOpen: boolean;
    currencyConversionModalIsOpen: boolean;
    deleteAccountingDocumentModalIsOpen:boolean
}

export type Action =
    | { type: "OPEN_CONFIRM_MODAL" }
    | { type: "CLOSE_CONFIRM_MODAL" }
    | { type: "OPEN_CREATE_YEAR_PLAN_MODAL" }
    | { type: "CLOSE_CREATE_YEAR_PLAN_MODAL" }
    | { type: "OPEN_CREATE_YEAR_PLAN_DRAWER" }
    | { type: "CLOSE_CREATE_YEAR_PLAN_DRAWER" }
    | { type: "OPEN_CONFIRM_DRAWER" }
    | { type: "CLOSE_CONFIRM_DRAWER" }
    | { type: "OPEN_ADD_TAG_MODAL" }
    | { type: "CLOSE_ADD_TAG_MODAL" }
    | { type: "OPEN_DYNAMIC_MODAL"; payload: IToolbarMenu | any }
    | { type: "CLOSE_DYNAMIC_MODAL" }
    | { type: "OPEN_GOOD_VARIANT_VALUES_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_GOOD_VARIANT_VALUES_MODAL" }
    | { type: "OPEN_GOOD_EXTRA_INFO_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_GOOD_EXTRA_INFO_MODAL" }
    | { type: "OPEN_USER_REPORT_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_USER_REPORT_MODAL" }
    | { type: "OPEN_GOOD_PRICE_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_GOOD_PRICE_MODAL" }
    | { type: "OPEN_PERSON_CONTACT_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_PERSON_CONTACT_MODAL" }
    | { type: "OPEN_CURRENCY_CONVERSION_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_CURRENCY_CONVERSION_MODAL" }
    | { type: "OPEN_DELETE_ACCOUNTING_DOCUMENT_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_DELETE_ACCOUNTING_DOCUMENT_MODAL" }
    | { type: "OPEN_ATTACHMENT_MODAL" }
    | { type: "CLOSE_ATTACHMENT_MODAL" }
    | { type: "OPEN_EXPIRE_DATE_ACCOUNT_LIST_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_EXPIRE_DATE_ACCOUNT_LIST_MODAL" }
    | { type: "OPEN_TAX_SETTINGS_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_TAX_SETTINGS_MODAL" }
    | { type: "OPEN_GOOD_SETTINGS_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_GOOD_SETTINGS_MODAL" }
    | { type: "OPEN_SETTLEMENT_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_SETTLEMENT_MODAL" }
    | { type: "OPEN_GOOD_QC_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_GOOD_QC_MODAL" }
    | { type: "OPEN_INVENTORY_INSPECTION_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_INVENTORY_INSPECTION_MODAL" }
    | { type: "OPEN_PHYSICAL_CHARACTERISTICS_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_PHYSICAL_CHARACTERISTICS_MODAL" }
    | { type: "OPEN_STOCK_WAREHOUSE_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_STOCK_WAREHOUSE_MODAL" }
    | { type: "OPEN_INVENTORY_CONTROL_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_INVENTORY_CONTROL_MODAL" }
    | { type: "OPEN_EXCEPTIONS_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_EXCEPTIONS_MODAL" }
    | { type: "OPEN_TRAINING_COURSE_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_TRAINING_COURSE_MODAL" }
    | { type: "OPEN_EDUCATION_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_EDUCATION_MODAL" }
    | { type: "OPEN_WORK_HISTORY_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_WORK_HISTORY_MODAL" }
    | { type: "OPEN_SPONSOR_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_SPONSOR_MODAL" }
    | { type: "OPEN_SPECIAL_SERVICES_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_SPECIAL_SERVICES_MODAL" }
    | { type: "OPEN_HISTORY_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_HISTORY_MODAL" }
    | { type: "OPEN_FORMULA_PARAMETER_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_FORMULA_PARAMETER_MODAL" }
    | { type: "OPEN_CHANGE_CURRENCY_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_CHANGE_CURRENCY_MODAL" }
    | { type: "OPEN_CHANGE_CURRENCY_RATE_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_CHANGE_CURRENCY_RATE_MODAL" }
    | { type: "OPEN_CUSTOMER_CREDIT_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_CUSTOMER_CREDIT_MODAL" }
    | { type: "OPEN_CUSTOMER_GROUP_CREDIT_MODAL"; payload: IToolbarMenu }
    | { type: "CLOSE_CUSTOMER_GROUP_CREDIT_MODAL" };
