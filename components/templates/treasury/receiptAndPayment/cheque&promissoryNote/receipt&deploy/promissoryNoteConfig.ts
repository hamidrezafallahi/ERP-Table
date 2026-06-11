import { IDetailColumnConfig } from "@components/organisms/erp-table";

export const promissoryNoteColumnConfig: IDetailColumnConfig[] = [
  {
    fieldName: "index",
    fieldCaption: " ردیف - عملیات",
    fieldType: "index",
    order: 1,
    enableDeleteButton: true,
    enableExpandButton: false,
    enableMoveButton: true,
    enableOptionsButton: true,
    visibility: { kind: "always" },
  },
  {
    fieldName: "SerialNumber",
    fieldCaption: "سریال سفته",
    fieldType: "text",
    visibility: { kind: "always" },
    order: 2,
  },
  {
    fieldName: "CheckSeries",
    fieldCaption: "سری سفته",
    fieldType: "text",
    visibility: { kind: "always" },
    order: 3,
  },
  {
    fieldName: "PromissoryNoteNumber",
    fieldCaption: "شماره سفته",
    fieldType: "text",
    visibility: { kind: "always" },
    order: 4,
  },
  {
    fieldName: "DocPrice",
    fieldCaption: "مبلغ",
    fieldType: "price",
    visibility: {
      kind: "always",
    },
    order: 5,
  },
  {
    fieldName: "DetailDesc",
    fieldCaption: "شرح",
    fieldType: "text",
    visibility: {
      kind: "always",
    },
    order: 6,
  },

  {
    fieldName: "ChequeStateDesc",
    fieldCaption: "وضعیت سفته",
    fieldType: "static",
    visibility: {
      kind: "always",
    },
    order: 7,
  },
  {
    fieldName: "IsRegistered",
    fieldCaption: "ثبت در سامانه صیادی",
    fieldType: "checkbox",
    visibility: {
      kind: "always",
    },
    order: 8,
  },
  {
    fieldName: "DigitalPromissoryNote ",
    fieldCaption: "دیجیتال سفته",
    fieldType: "checkbox",
    visibility: { kind: "always" },
    order: 9,
  },
  {
    fieldName: "DocumentChequeId",
    fieldCaption: "شناسه چک",
    fieldType: "number",
    order: 10,
    visibility: { kind: "always" },
  },
];
