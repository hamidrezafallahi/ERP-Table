import type { IChequeDynamicConfig } from "./type";

const toAnotherCash: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkAssignment/atTheCash",
  updateUrl: "",
  voucherTypeId: 5066,
  conditionalFields: false,
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
    {
      name: "ToCashierId",
      caption: "صندوقدار",
      help: "این فیلد برای وارد کردن صندوقدار می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "/api/trh/Select/Cashier4SelectOption",
        endpoint: "/api/trh/Select/Cashier4SelectOption",
        repoViewId: 140002,
      },
      placeHolder: "",
      order: 3,
    },
  ],
};
const toBank: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkAssignment/atTheBank",
  updateUrl: "",
  voucherTypeId: 5064,
  conditionalFields: true,
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
    {
      name: "BankAccountId",
      caption: "به حساب بانکی",
      help: "این فیلد برای وارد کردن حساب بانکی می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "api/trh/select/bankAccount4SelectOPtion",
        endpoint: "api/trh/select/bankAccount4SelectOPtion",
        repoViewId: 106081,
      },
      placeHolder: "",
      order: 3,
    },
  ],
};
const toPerson: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkAssignment/atThePerson",
  updateUrl: "",
  voucherTypeId: 5065,
  conditionalFields: true,
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
  ],
};
const chequeReturn: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkRejected/atTheCash",
  updateUrl: "",
  voucherTypeId: 5072,
  conditionalFields: true,
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
    {
      name: "ToCashierId",
      caption: "صندوقدار",
      help: "این فیلد برای وارد کردن صندوقدار می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "/api/trh/Select/Cashier4SelectOption",
        endpoint: "/api/trh/Select/Cashier4SelectOption",
        repoViewId: 140002,
      },
      placeHolder: "",
      order: 3,
    },
  ],
};
const customerReturn: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkRejected/atTheCash",
  updateUrl: "",
  voucherTypeId: 5074,
  conditionalFields: true,
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
    // {
    //   name: "PersonId",
    //   caption: "شخص",
    //   help: "این فیلد برای وارد کردن شخص می باشد",
    //   type: "selectOption",
    //   rules: [
    //     { required: true, message: "این فیلد الزامی است.", type: "number" },
    //   ],
    //   selectEndpoint: {
    //     addWebUrl: "/api/trh/Select/Cashier4SelectOption",
    //     endpoint: "/api/trh/Select/Cashier4SelectOption",
    //     repoViewId: 3004,
    //   },
    //   placeHolder: "",
    //   order: 3,
    // },
    {
      name: "ToCashierId",
      caption: "صندوقدار",
      help: "این فیلد برای وارد کردن صندوقدار می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "/api/trh/Select/Cashier4SelectOption",
        endpoint: "/api/trh/Select/Cashier4SelectOption",
        repoViewId: 140002,
      },
      placeHolder: "",
      order: 3,
    },
  ],
};
const collect: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkCashing/directCollect",
  updateUrl: "",
  voucherTypeId: 5071,
  conditionalFields: true,
  alternativeFindKey: "CheckReceiptHeader.CashierId",
  alternativeKey: "ToCashierId",
  alternativeErr: "صندوق چک های انتخابی باهم یکسان نمی باشد!",
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
    {
      name: "BankAccountId",
      caption: "حساب جاری",
      help: "این فیلد برای وارد کردن حساب جاری می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "api/trh/select/bankAccount4SelectOPtion",
        endpoint: "api/trh/select/bankAccount4SelectOPtion",
        repoViewId: 106081,
      },
      placeHolder: "",
      order: 3,
    },
    {
      name: "FishNumber",
      caption: "شماره فیش",
      help: "این فیلد برای وارد کردن شماره فیش می باشد",
      type: "text",
      rules: [
        {
          required: true,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 4,
    },
  ],
};
const directCollect: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkCashing/directCollect",
  updateUrl: "",
  voucherTypeId: 5068,
  conditionalFields: true,
  alternativeFindKey: "CheckReceiptHeader.CashierId",
  alternativeKey: "ToCashierId",
  alternativeErr: "صندوق چک های انتخابی باهم یکسان نمی باشد!",
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
    {
      name: "BankAccountId",
      caption: "حساب جاری",
      help: "این فیلد برای وارد کردن حساب جاری می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "api/trh/select/bankAccount4SelectOPtion",
        endpoint: "api/trh/select/bankAccount4SelectOPtion",
        repoViewId: 106081,
      },
      placeHolder: "",
      order: 3,
    },
    {
      name: "FishNumber",
      caption: "شماره فیش",
      help: "این فیلد برای وارد کردن شماره فیش می باشد",
      type: "text",
      rules: [
        {
          required: true,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 4,
    },
  ],
};
const cashierCollect: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkCashing/cashierCollect",
  updateUrl: "",
  voucherTypeId: 5069,
  conditionalFields: true,
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
    {
      name: "BankAccountId",
      caption: "حساب جاری",
      help: "این فیلد برای وارد کردن حساب جاری می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "api/trh/select/bankAccount4SelectOPtion",
        endpoint: "api/trh/select/bankAccount4SelectOPtion",
        repoViewId: 106081,
      },
      placeHolder: "",
      order: 3,
    },
    {
      name: "ToCashierId",
      caption: "صندوقدار",
      help: "این فیلد برای وارد کردن صندوقدار می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "/api/trh/Select/Cashier4SelectOption",
        endpoint: "/api/trh/Select/Cashier4SelectOption",
        repoViewId: 140002,
      },
      placeHolder: "",
      order: 3,
    },
  ],
};
const cashFundCollect: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkCashing/cashFounderCollect",
  updateUrl: "",
  voucherTypeId: 5070,
  conditionalFields: true,
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
    {
      name: "BankAccountId",
      caption: "حساب جاری",
      help: "این فیلد برای وارد کردن حساب جاری می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "api/trh/select/bankAccount4SelectOPtion",
        endpoint: "api/trh/select/bankAccount4SelectOPtion",
        repoViewId: 106081,
      },
      placeHolder: "",
      order: 3,
    },
    {
      name: "TankhahdarId",
      caption: "تنخواه دار",
      help: "این فیلد برای وارد کردن صندوقدار می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "/api/trh/Select/TankhahDar4SelectOption",
        endpoint: "/api/trh/Select/TankhahDar4SelectOption",
        repoViewId: 140002,
      },
      placeHolder: "",
      order: 3,
    },
  ],
};
const customerRefunding: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/CheckReversal/toCustomer",
  updateUrl: "",
  voucherTypeId: 5067,
  conditionalFields: true,
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
  ],
};
const bankRefunding: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/CheckReversal/fromTheBank",
  updateUrl: "",
  voucherTypeId: 5073,
  conditionalFields: true,
  formFields: [
    {
      name: "VoucherDate",
      caption: "تاریخ",
      help: "این فیلد برای وارد کردن تاریخ می باشد",
      type: "date",
      rules: [
        {
          required: false,
          message: "این فیلد الزامی است",
        },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 1,
    },
    {
      name: "VoucherDesc",
      caption: "شرح",
      help: "این فیلد برای وارد کردن شرح می باشد",
      type: "text",
      rules: [
        { required: true, message: "این فیلد الزامی است", type: "string" },
      ],
      selectEndpoint: {},
      placeHolder: "",
      order: 2,
    },
    {
      name: "CashierId",
      caption: "صندوقدار",
      help: "این فیلد برای وارد کردن صندوقدار می باشد",
      type: "selectOption",
      rules: [
        { required: true, message: "این فیلد الزامی است.", type: "number" },
      ],
      selectEndpoint: {
        addWebUrl: "/api/trh/Select/Cashier4SelectOption",
        endpoint: "/api/trh/Select/Cashier4SelectOption",
        repoViewId: 140002,
      },
      placeHolder: "",
      order: 3,
    },
  ],
};

export const chequeDynamicConfig = [
  { name: "واگذاری چک به سایر صندوق ها", config: toAnotherCash },
  { name: "واگذاری چک به بانک", config: toBank },
  { name: "واگذاری چک به شخص", config: toPerson },
  { name: "برگشت چک", config: chequeReturn },
  { name: "برگشت چک مشتریان", config: customerReturn },
  { name: "وصول چک", config: collect },
  { name: "وصول مستقیم چک", config: directCollect },
  { name: "وصول چک توسط صندوقدار", config: cashierCollect },
  { name: "وصول چک توسط تنخواه دار", config: cashFundCollect },
  { name: "استرداد چک به مشتریان", config: customerRefunding },
  { name: "استرداد چک از بانک", config: bankRefunding },
];
