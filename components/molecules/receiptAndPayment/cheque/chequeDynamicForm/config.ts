import { Level4TypeEnum } from "@components/molecules/dynamicLevelFields/enum";
import type {
  ChequeDynamicConfigProps,
  FormField,
  IChequeDynamicConfig,
} from "./type";

const baseFields: FormField[] = [
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
    rules: [{ required: true, message: "این فیلد الزامی است", type: "string" }],
    selectEndpoint: {},
    placeHolder: "",
    order: 2,
  },
];

const toAnotherCash: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkAssignment/atTheCash",
  updateUrl: "",
  voucherTypeId: 5066,
  conditionalFields: true,
  formFields: [...baseFields],
};
const toBank: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkAssignment/atTheBank",
  updateUrl: "",
  voucherTypeId: 5064,
  conditionalFields: true,
  formFields: [...baseFields],
};
const toPerson: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkAssignment/atThePerson",
  updateUrl: "",
  voucherTypeId: 5065,
  conditionalFields: true,
  formFields: [...baseFields],
};
const chequeReturn: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkRejected/atTheCash",
  updateUrl: "",
  voucherTypeId: 5072,
  conditionalFields: true,
  formFields: [...baseFields],
};
const customerReturn: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkRejected/atTheCash",
  updateUrl: "",
  voucherTypeId: 5074,
  conditionalFields: true,
  formFields: [...baseFields],
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
    ...baseFields,
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
      order: 3,
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
    ...baseFields,
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
      order: 3,
    },
  ],
};
const cashierCollect: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkCashing/cashierCollect",
  updateUrl: "",
  voucherTypeId: 5069,
  conditionalFields: true,
  formFields: [...baseFields],
};
const cashFundCollect: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/checkCashing/cashFounderCollect",
  updateUrl: "",
  voucherTypeId: 5070,
  conditionalFields: true,
  formFields: [...baseFields],
};
const customerRefunding: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/CheckReversal/toCustomer",
  updateUrl: "",
  voucherTypeId: 5067,
  conditionalFields: false,
  formFields: [...baseFields],
};
const bankRefunding: IChequeDynamicConfig = {
  deleteUrl: "",
  createUrl: "/api/trh/insert/CheckReversal/fromTheBank",
  updateUrl: "",
  voucherTypeId: 5073,
  conditionalFields: false,
  formFields: [
    ...baseFields,
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

export const chequeDynamicConfig: ChequeDynamicConfigProps[] = [
  {
    name: "واگذاری چک به سایر صندوق ها",
    config: toAnotherCash,
    level4Type: Level4TypeEnum.Cashier,
  },
  {
    name: "واگذاری چک به بانک",
    config: toBank,
    level4Type: Level4TypeEnum.BankAccount,
  },
  {
    name: "واگذاری چک به شخص",
    config: toPerson,
    level4Type: Level4TypeEnum.Person,
  },
  {
    name: "برگشت چک",
    config: chequeReturn,
    level4Type: Level4TypeEnum.Cashier,
  },
  {
    name: "برگشت چک مشتریان",
    config: customerReturn,
    level4Type: Level4TypeEnum.Cashier,
  },
  { name: "وصول چک", config: collect, level4Type: Level4TypeEnum.BankAccount },
  {
    name: "وصول مستقیم چک",
    config: directCollect,
    level4Type: Level4TypeEnum.BankAccount,
  },
  {
    name: "وصول چک توسط صندوقدار",
    config: cashierCollect,
    level4Type: Level4TypeEnum.Cashier,
  },
  {
    name: "وصول چک توسط تنخواه دار",
    config: cashFundCollect,
    level4Type: Level4TypeEnum.Tankhahdar,
  },
  {
    name: "استرداد چک به مشتریان",
    config: customerRefunding,
  },
  {
    name: "استرداد چک از بانک",
    config: bankRefunding,
  },
];
export const chequeDynamicConfigMap = new Map(
  chequeDynamicConfig.map((item) => [item.name, item]),
);
