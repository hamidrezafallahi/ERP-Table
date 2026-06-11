import { IDetailColumnConfig } from '@components/organisms/erp-table';
import { IMultiSelectConfig } from '@components/organisms/erp-table/ui/type';
import type { IFormFieldConfig } from '@type/elementType';
import {
  ChequeState,
  eChequePrommisoryType,
} from '@type/enum';

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "text",
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
  },
  {
    name: "RpWayId",
    caption: "نحوه پرداخت",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "api/trh/select/rpWay4voucher",
    },
  },
  {
    name: "VoucherTypeId",
    caption: "نوع سند",
    type: "number",
  },
  {
    name: "VoucherNatureId",
    caption: "ماهیت چک",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "api/trh/select/commonInfo/voucherNature",
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
    caption: "شرح سند",
    type: "text",
  },

];
export const columnConfig = (
  type: string,
  VoucherNatureId: number
): IDetailColumnConfig[] => {
  return [
    {
      fieldName: "index",
      fieldCaption: " ردیف - عملیات",
      fieldType: "index",
      order: 1,
      visibility: { kind: 'always' },

    }, {
      fieldName: "DocumentChequeId",
      fieldCaption: `${type == "Cheque" ? "چک":"شماره سفته"}`,
      fieldType: "selectOption",
      visibility: { kind: "always" },
      returnValue(values, colId) {
        return values["DocumentChequeId"]
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          IssuerSerial?: string;
          DocPrice?: number;
        } | undefined;
        const issuerSerial = cheque?.IssuerSerial ?? "";
        const docPrice = cheque?.DocPrice ?? "";
        return `${issuerSerial} - ${docPrice}`;
      },
      dynamicSource: {
        endpoint: "api/trh/select/SelectOption/DocumentCheck",
        Types: [ChequeState["AtTheCash"]],
        PrommisoryType: eChequePrommisoryType[type],
        VoucherNatureId
      },
      resolveOn: {
        fieldName: "DocumentChequeId",
        endpoint: "api/trh/select/documentCheque",
        buildParams: (row) => ({
          Id: Number(row.DocumentChequeId),
          Types: [ChequeState["AtTheCash"]],
          PrommisoryType: eChequePrommisoryType[type]
        }),
        getResponse(response, row) {
          if (response?.Result === "Success") {
            row.getCell("MaturityDate")?.changeValue(response.Data[0]["MaturityDate"])
            row.getCell("ShibaNumber")?.changeValue(response.Data[0]["ShibaNumber"])
            row.getCell("CheckSeries")?.changeValue(response.Data[0]["CheckSeries"])
            row.getCell("SerialNumber")?.changeValue(response.Data[0]["SerialNumber"])
            row.getCell("IssuerSerial")?.changeValue(response.Data[0]["IssuerSerial"])
            row.getCell("BankDesc")?.changeValue(response.Data[0]["BankDesc"])
            row.getCell("DocPrice")?.changeValue(response.Data[0]["DocPrice"])
            row.getCell("StateId")?.changeValue(response.Data[0]["StateId"])
          }
        },
      },
      order: 2,
    }
    , {
      fieldName: "document.IssuerSerial",
      fieldCaption: "شماره صیاد",
      fieldType: "static",
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          IssuerSerial?: string;
          DocPrice?: number;
        } | undefined;
        return cheque?.IssuerSerial ?? "";
      },

      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          IssuerSerial?: string;
          DocPrice?: number;
        } | undefined;
        return cheque?.IssuerSerial ?? "";
      },
      order: 3,
    },
    {
      fieldName: "CheckSeries",
      fieldCaption:`${type == "Cheque" ? "سری چک":"سری سفته"}` ,
      fieldType: "static",
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          CheckSeries?: string;

        } | undefined;
        return cheque?.CheckSeries ?? "";
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          CheckSeries?: string;

        } | undefined;
        return cheque?.CheckSeries ?? "";
      },
      order: 4,
    },
    {
      fieldName: "SerialNumber",
      fieldCaption: `${type == "Cheque" ? "سریال چک":"سریال سفته"}`,
      fieldType: "static",
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          SerialNumber?: string;
        } | undefined;
        return cheque?.SerialNumber ?? "";
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          SerialNumber?: string;
        } | undefined;
        return cheque?.SerialNumber ?? "";
      },
      order: 4,
    },
    {
      fieldName: "ShibaNumber",
      fieldCaption: "شماره شبا",
      fieldType: "static",
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          ShibaNumber?: string;
        } | undefined;
        return cheque?.ShibaNumber ?? "";
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          ShibaNumber?: string;
        } | undefined;
        return cheque?.ShibaNumber ?? "";
      },
      order: 5,
    },
    {
      fieldName: "MaturityDate",
      fieldCaption: "تاریخ سررسید",
      fieldType: "date",
      editable: false,
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          MaturityDate?: string;
        } | undefined;
        return cheque?.MaturityDate ?? "";
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          MaturityDate?: string;
        } | undefined;
        return cheque?.MaturityDate ?? "";
      },
      order: 6,
    },
    {
      fieldName: "BankDesc",
      fieldCaption: "بانک",
      fieldType: "text",
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          BankDesc?: string;
        } | undefined;
        return cheque?.BankDesc ?? "";
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          BankDesc?: string;
        } | undefined;
        return cheque?.BankDesc ?? "";
      },
      order: 7,
    },
    {
      fieldName: "BankBranch",//////////////////////////////////////
      fieldCaption: "شعبه",
      fieldType: "static",
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          BankBranch?: string;
        } | undefined;
        return cheque?.BankBranch ?? "";
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          BankBranch?: string;
        } | undefined;
        return cheque?.BankBranch ?? "";
      },
      order: 8,
    },
    {
      fieldName: "DocPrice",
      fieldCaption: "مبلغ",
      fieldType: "price",
      editable: false,
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          DocPrice?: string;
        } | undefined;
        return cheque?.DocPrice ?? "";
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          DocPrice?: string;
        } | undefined;
        return cheque?.DocPrice ?? "";
      },
      order: 9,
    },
    {
      fieldName: "DetailDesc",/////////////////////////////////////////////
      fieldCaption: "شرح ردیف",
      fieldType: "text",
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          DetailDesc?: string;
        } | undefined;
        return cheque?.DetailDesc ?? "";
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          DetailDesc?: string;
        } | undefined;
        return cheque?.DetailDesc ?? "";
      },
      order: 10,
    },
    {
      fieldName: "StateId",
      fieldCaption: "وضعیت چک/سفته",
      fieldType: "static",
      visibility: { kind: "always" },
      returnValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          StateId?: string;
        } | undefined;
        return cheque?.StateId ?? "";
      },
      returnDisplayValue(values, colId) {
        const cheque = values?.["DocumentCheque"] as {
          StateId?: string;
        } | undefined;
        return cheque?.StateId ?? "";
      },
      order: 11,
    },

  ]
}

export const multiSelectConfig: IMultiSelectConfig = {
  dynamicValue: {
    endpoint: "api/trh/select/documentCheque",
    repoViewId: 140019,
    Types: [ChequeState["AtTheCash"]],
    PrommisoryType: eChequePrommisoryType['Cheque']

  },
  fieldKey: "DocumentChequeId",
  detailFieldKey: "DocumentChequeId",

  onAdd(e) {
    console.log(e)
  },

  ListConfig: [
    {
      fieldName: "index",
      fieldCaption: "index",
      fieldType: "index"

    },
    {
      fieldName: "DocumentChequeId",
      fieldCaption: "آیدی چک",
      fieldType: "number",
      returnValue(row, colId) {
        console.log("here")

        return row[colId]
      },
      returnDisplayValue(row, colId) {
        return `${row["IssuerSerial"]} _ ${row["DocPrice"]}`
      },

    },
    {
      fieldName: "DocPrice",
      fieldCaption: "مبلغ سند",
      fieldType: "price",

    },
    {
      fieldName: "ShibaNumber",
      fieldCaption: "شماره شبا",
      fieldType: "text"
    },
    {
      fieldName: "DigitalCheck",
      fieldCaption: "چک دیجیتال",
      fieldType: "checkbox"
    },
    // {
    //   fieldName: "ChequePrommisoryType",
    //   fieldCaption: "نوع چک / سفته",
    //   fieldType: "int"
    // },
    // {
    //   fieldName: "DigitalPromissoryNote",
    //   fieldCaption: "سفته دیجیتال",
    //   fieldType: "bool"
    // },
    {
      fieldName: "CheckSeries",
      fieldCaption: "سری چک",
      fieldType: "text"
    },
    {
      fieldName: "SerialNumber",
      fieldCaption: "شماره سریال",
      fieldType: "text"
    },
    // {
    //   fieldName: "PromissoryNoteNumber",
    //   fieldCaption: "شماره سفته",
    //   fieldType: "string"
    // },
    {
      fieldName: "IssuerSerial",
      fieldCaption: "سریال صیاد",
      fieldType: "text"
    },
    {
      fieldName: "Payer.TafsiliDesc",
      fieldCaption: "نام پرداخت‌کننده",
      fieldType: "text"
    }
  ]
}

