import type { IFormFieldConfig } from "@type/elementType";

export const formConfig: IFormFieldConfig[] = [
  {
    name: "HasOpening",
    caption: "زدن افتتاحیه",
    type: "boolean",
    value: false,
    originalValue: false,
    isTitleField: false,
  },
  {
    name: "OpeningYearId",
    caption: "سال مالی",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/com/select/year4SelectOption",
      endpoint: "/api/com/select/year4SelectOption",
      repoViewId: null,
    },
  },
  {
    name: "BlanceVoucherBalancedAccountId",
    caption: "بستن هزینه",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/account/moeen",
      endpoint: "/api/acc/select/account/moeen",
      repoViewId: null,
    },
  },
  {
    name: "BalancedEarnedAccountId",
    caption: "بستن درآمد",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/account/moeen",
      endpoint: "/api/acc/select/account/moeen",
      repoViewId: null,
    },
  },
  {
    name: "ProfitAccountId",
    caption: "سود و زیان",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/account/moeen",
      endpoint: "/api/acc/select/account/moeen",
      repoViewId: null,
    },
  },
  {
    name: "BalancedProfitAccountId",
    caption: "حساب های انباشته",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/account/moeen",
      endpoint: "/api/acc/select/account/moeen",
      repoViewId: null,
    },
  },
  {
    name: "ConclusionAccountId",
    caption: "سند اختتامیه",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/account/moeen",
      endpoint: "/api/acc/select/account/moeen",
      repoViewId: null,
    },
  },
  {
    name: "BalancedOpeningAccountId",
    caption: "سند افتتاحیه",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/account/moeen",
      endpoint: "/api/acc/select/account/moeen",
      repoViewId: null,
    },
  },
];
