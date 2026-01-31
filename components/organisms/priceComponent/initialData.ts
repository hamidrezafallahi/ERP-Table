export const initialData: any = [
  // {
  //   name: "VoucherNumber",
  //   caption: "شماره سند",
  //   type: "number",
  //   value: undefined,
  //   originalValue: undefined,
  //   isTitleField: false,
  // },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "VoucherTypeId",
    caption: "نوع سند",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "ReferNumber",
    caption: "شماره ارجاع",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "VoucherDesc",
    caption: "شرح سند",
    type: "text",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "Details",
    caption: "اقلام سند",
    type: "array",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
];

// export interface IVoucherColumnConfig {
//   fieldName: keyof IVoucherDetails | "index";
//   fieldCaption: string;
//   level?: number;
//   fieldType: "text" | "number" | "treeOption" | "selectOption" | "index";
//   dynamicValue?: IRequestConfig;
// }

// export const columnsConfig: IVoucherColumnConfig[] = [
//   {
//     fieldName: "index",
//     fieldCaption: `ردیف - عملیات`,
//     fieldType: "index",
//   },
//   {
//     fieldName: "AccountId",
//     fieldCaption: "سرفصل حساب",
//     fieldType: "treeOption",
//   },
//   {
//     fieldName: "TafsiliId",
//     level: 4,
//     fieldCaption: "تفصیلی",
//     fieldType: "selectOption",
//     dynamicValue: {
//       endpoint: "/api/acc/select/tafsiliLevel4",
// repoViewId: 5003
//     },
//   },
//   {
//     fieldName: "FifthId",
//     level: 5,
//     fieldCaption: "سطح پنجم",
//     fieldType: "selectOption",
//     dynamicValue: {
//       endpoint: "/api/acc/select/tafsiliLevel5",
//     },
//   },
//   {
//     fieldName: "SixthId",
//     level: 6,
//     fieldCaption: "سطح ششم",
//     fieldType: "selectOption",
//     dynamicValue: {
//       endpoint: "/api/acc/select/tafsiliLevel6",
//     },
//   },
//   {
//     fieldName: "SeventhId",
//     level: 7,
//     fieldCaption: "سطح هفتم",
//     fieldType: "selectOption",
//     dynamicValue: {
//       endpoint: "/api/acc/select/tafsiliLevel7",
//     },
//   },
//   {
//     fieldName: "EightId",
//     level: 8,
//     fieldCaption: "سطح هشتم",
//     fieldType: "selectOption",
//     dynamicValue: {
//       endpoint: "/api/acc/select/tafsiliLevel8",
//     },
//   },
//   {
//     fieldName: "NineId",
//     level: 9,
//     fieldCaption: "سطح نهم",
//     fieldType: "selectOption",
//     dynamicValue: {
//       endpoint: "/api/acc/select/tafsiliLevel9",
//     },
//   },
//   {
//     fieldName: "TenId",
//     level: 10,
//     fieldCaption: "سطح دهم",
//     fieldType: "selectOption",
//     dynamicValue: {
//       endpoint: "/api/acc/select/tafsiliLevel10",
//     },
//   },
//   {
//     fieldName: "DetailDesc",
//     fieldCaption: "شرح سند",
//     fieldType: "text",
//   },
//   {
//     fieldName: "Bes",
//     fieldCaption: "بدهکار",
//     fieldType: "number",
//   },
//   {
//     fieldName: "Bed",
//     fieldCaption: "بستانکار",
//     fieldType: "number",
//   },
// ];
