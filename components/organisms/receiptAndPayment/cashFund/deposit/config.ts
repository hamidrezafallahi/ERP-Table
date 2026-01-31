import type { IFormFieldConfig } from "@type/elementType";

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "number",
  },
  {
    name: "BankStatementId",
    caption: "شناسه",
    type: "number",
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
  },
  {
    name: "TankhahdarId",
    caption: "واریز به تنخواه",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/trh/Select/TankhahDar4SelectOption",
      endpoint: "api/trh/Select/TankhahDar4SelectOption",
      repoViewId: 140002,
    },
  },
  {
    name: "Price",
    caption: "مبلغ",
    type: "price",
  },
  {
    name: "RpWayId",
    caption: "نحوه دریافت و پرداخت",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/trh/select/rpWay4voucher",
      endpoint: "api/trh/select/rpWay4voucher",
      repoViewId: null,
    },
  },
  {
    name: "TafsiliId",
    caption: "سطح چهارم",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel4",
      endpoint: "/api/acc/select/tafsiliLevel4",
      repoViewId: 10017,
    },
  },
  {
    name: "FifthId",
    caption: "سطح پنجم",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel5",
      endpoint: "/api/acc/select/tafsiliLevel5",
    },
  },
  {
    name: "SixthId",
    caption: "سطح ششم",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel6",
      endpoint: "/api/acc/select/tafsiliLevel6",
    },
  },
  {
    name: "SeventhId",
    caption: "سطح 7",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel7",
      endpoint: "/api/acc/select/tafsiliLevel7",
    },
  },
  {
    name: "EightId",
    caption: "سطح 8",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel8",
      endpoint: "/api/acc/select/tafsiliLevel8",
    },
  },
  {
    name: "NineId",
    caption: "سطح 9",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel9",
      endpoint: "/api/acc/select/tafsiliLevel9",
    },
  },
  {
    name: "TenId",
    caption: "سطح 10",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel10",
      endpoint: "/api/acc/select/tafsiliLevel10",
    },
  },
  {
    name: "ElevenId",
    caption: "سطح 11",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel11",
      endpoint: "/api/acc/select/tafsiliLevel11",
    },
  },
  {
    name: "TwelveId",
    caption: "سطح 12",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel12",
      endpoint: "/api/acc/select/tafsiliLevel12",
    },
  },
  {
    name: "ThirteenId",
    caption: "سطح 13",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel13",
      endpoint: "/api/acc/select/tafsiliLevel13",
    },
  },
  {
    name: "VoucherDesc",
    caption: "شرح نحوه",
    type: "text",
  },
];
