import moment from 'moment';

import { IDetailColumnConfig } from '@components/organisms/erp-table';
import { ItemType } from '@components/organisms/erp-table/engine/type';
import { IFormFieldConfig } from '@type/elementType';

export const formConfig: IFormFieldConfig[] = [

  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "text",
    value: undefined,
    originalValue: undefined
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
    value: moment(new Date()).toISOString(),
    originalValue: moment(new Date()).toISOString()
  },
  {
    name: "VoucherTypeId",
    caption: "نوع سند",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/acc/insert/voucherType4searchBox",
      endpoint: "/api/acc/select/voucherType4searchBox",
      OrderInfo: [{ Asc: true, ColName: "VoucherTypeId" }]
    },
    value: undefined,
    originalValue: undefined
  }, {
    name: "ReferNumber",
    caption: "شماره ارجاع",
    type: "number",
    value: undefined,
    originalValue: undefined
  },
  {
    name: "VoucherDesc",
    caption: "شرح سند",
    type: "text",
    value: undefined,
    originalValue: undefined
  },
];
const items: ItemType[] = [{ key: "copy", label: ("copy label"), icon: 'RedTrashBin' }, { key: "delete", label: ("delete label"), icon: 'RedTrashBin' }]

export const columnConfig = (t: (e: string) => string): IDetailColumnConfig[] => {
  return [
    {
      fieldName: "index",
      fieldCaption: " ردیف - عملیات",
      fieldType: "index",
      order: 1,
      enableDeleteButton: true,
      enableExpandButton: false,
      enableMoveButton: true,
      enableOptionsButton: true,
      visibility: { kind: 'always' },
      indexOptions: (tableKey, rowId, row, controller) => {
        const AllRows = controller.getAllRows()
        const activeCol = controller.getViewState().activeCell?.columnId
        const sumBed = AllRows.reduce((acc, curr) => acc + (curr.cells['Bed'].value as number || 0), 0)
        const sumBes = AllRows.reduce((acc, curr) => acc + (curr.cells['Bes'].value as number || 0), 0)
        const rowBed = row.cells['Bed'].value as number
        const rowBes = row.cells['Bes'].value as number
        const sumDifference = Math.abs(sumBed - sumBes)
        const adjustToZeroBalance = () => {
          if (sumBed === sumBes) {
            return
          } else if (sumBed > sumBes) {
            if (rowBed >= rowBes) {//چک شد
              console.log("الان بدهکار کلی هستی  و در سطر هم بدهکاری")
              if (rowBed > sumDifference) {

                controller.dispatch({ type: 'UI_CELL_CHANGE', value: rowBed - sumDifference, rowId, columnId: "Bed" })
              } else {
                controller.dispatch({ type: 'UI_CELL_CHANGE', value: sumDifference - rowBed, rowId, columnId: "Bes" })
                controller.dispatch({ type: 'UI_CELL_CHANGE', value: 0, rowId, columnId: "Bed", })
              }
            } else {
              controller.dispatch({ type: 'UI_CELL_CHANGE', value: sumDifference + rowBes, rowId, columnId: "Bes", })
            }
          } else {
            if (rowBed >= rowBes) {
              controller.dispatch({ type: 'UI_CELL_CHANGE', value: rowBed + sumDifference, rowId, columnId: "Bed", })
            } else {
              if (sumDifference >= rowBes) {
                controller.dispatch({ type: 'UI_CELL_CHANGE', value: sumDifference - rowBes, rowId, columnId: "Bed", })
                controller.dispatch({ type: 'UI_CELL_CHANGE', value: 0, rowId, columnId: "Bes", })
              } else {
                controller.dispatch({ type: 'UI_CELL_CHANGE', value: rowBes - sumDifference, rowId, columnId: "Bes", })
              }
            }
          }
        }
        const duplicateFromUpperRow = () => {
          const rowIndex = AllRows.findIndex(r => r.id === rowId)
          if (rowIndex && activeCol) {
            const previousRowValue = AllRows[rowIndex - 1].cells[activeCol]?.value
            if (previousRowValue) {
              controller.dispatch({ type: 'UI_CELL_CHANGE', value: previousRowValue, rowId, columnId: activeCol, })
            }
          }


        }
        const swapDebtorCreditor = () => {
          controller.dispatch({ type: 'UI_CELL_CHANGE', value: rowBed, rowId, columnId: "Bes" })
          controller.dispatch({ type: 'UI_CELL_CHANGE', value: rowBes, rowId, columnId: "Bed", })
        }
        return [
          {
            key: "10",
            label: (t("general.adjustToZeroBalance")),
            disabled: sumBed === sumBes,
            onClick: () => { adjustToZeroBalance() },
            // extra: "Ctrl + S",
          }, {
            key: "11",
            label: (t("general.duplicateFromUpperRow")),
            onClick: () => { duplicateFromUpperRow() },
            // extra: "Ctrl + S",
          }, {
            key: "12", label: (t("general.swapDebtorCreditor")),
            onClick: () => { swapDebtorCreditor() },
          },
        ]
      },
    },
    {
      fieldName: "AccountId",
      fieldCaption: t("general.accountTitle"),
      fieldType: "selectOption",
      visibility: { kind: 'always' },
      dynamicSource: {
        endpoint: "api/acc/select/account/moeen",
        OrderInfo: [{ Asc: true, ColName: "AccountId" }]
        // repoViewId: 130063
      },
      resolveOn: {
        fieldName: "AccountId",
        endpoint: "api/acc/select/account4voucher",
        buildParams: (row) => ({
          Id: Number(row.AccountId),
          repoViewId: 10001,
        }),
        mapFlags: (res) => {
          const temp = res.Data[0]
          // return res.Data[0]
          return {
            FifthId: res.Data[0].HasFifth,
            SixthId: res.Data[0].HasSixth,
            SeventhId: res.Data[0].HasSeventh,
            EightId: res.Data[0].HasEight,
            NineId: res.Data[0].HasNine,
            TenId: res.Data[0].HasTen,
            ElevenId: res.Data[0].HasEleven,
            TwelveId: res.Data[0].HasTwelve,
            ThirteenId: res.Data[0].HasThirteen,
            CurrencyId: res.Data[0].IsCurrency,
            CurrencyNumber: res.Data[0].IsCurrency,
            CurrencyRate: res.Data[0].IsCurrency,
            ReferNumber: res.Data[0].IsRefer,
            ReferDate: res.Data[0].IsRefer,
            FollowUpNumber: res.Data[0].IsFollow,
            Count: res.Data[0].IsNumber,
            InsuranceNumber: res.Data[0].IsInsurance,
            IsCurrencyVoucher: res.Data[0].IsCurrencyVoucher,
            // IsError: res.Data[0].IsError,
            // IsWarning: res.Data[0].IsWarning,
          }
        },
      },
      //   displayFormat: (value) => {
      //     console.log(value)
      //   return `نمایشگر - ${value}`
      // },
      dynamicSelectFilterOption: (input, option) => {
        const label = option?.label;
        return (
          typeof label === "string" &&
          option.option._SelectDisplay
            .toLowerCase()
            .includes(input)
        );
      },
      minWidth: 144,
      popUpWidth: 400,
      labelValue: "selectValue",
      order: 2
    },
    {
      fieldName: "TafsiliId",
      fieldCaption: t("general.tafsili"),
      fieldType: "selectOption",
      minWidth: 160,
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel4",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null },
        OrderInfo: [{ Asc: true, ColName: "TafsiliId" }]

      },

      visibility: {
        kind: "always",

      },
      labelValue: "selectValue",

      order: 3
    }, {
      fieldName: "FifthId",
      fieldCaption: t("general.level5"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel5",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "FifthId",
      },
      labelValue: "selectValue",

      order: 4
    },
    {
      fieldName: "SixthId",
      fieldCaption: t("general.level6"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel6",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "SixthId",
      },
      labelValue: "selectValue",

      order: 5
    },
    {
      fieldName: "SeventhId",
      fieldCaption: t("general.level7"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel7",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "SeventhId",
      },
      labelValue: "selectValue",

      order: 6
    },
    {
      fieldName: "EightId",
      fieldCaption: t("general.level8"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel8",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "EightId",
      },
      labelValue: "selectValue",

      order: 7
    },
    {
      fieldName: "NineId",
      fieldCaption: t("general.level9"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel9",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "NineId",
      },
      labelValue: "selectValue",

      order: 8
    },
    {
      fieldName: "TenId",
      fieldCaption: t("general.level10"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel10",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "TenId",
      },
      labelValue: "selectValue",

      order: 9
    },
    {
      fieldName: "ElevenId",
      fieldCaption: t("general.level11"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel11",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "ElevenId",
      },
      labelValue: "selectValue",

      order: 10
    },
    {
      fieldName: "TwelveId",
      fieldCaption: t("general.level12"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel12",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "TwelveId",
      },
      labelValue: "selectValue",

      order: 11
    },
    {
      fieldName: "ThirteenId",
      fieldCaption: t("general.level13"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel13",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "ThirteenId",
      },
      labelValue: "selectValue",

      order: 12
    }, {
      fieldName: "DetailDesc",
      fieldCaption: t("general.rowDescription"),
      fieldType: "description",//must be description after complete desc component
      dynamicSource: {
        endpoint: "/api/acc/select/accountDescription",
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "id", value: null }
      },
      style: { width: 250 },
      visibility: { kind: 'always' },
      order: 13
    },
    {
      fieldName: "Bed",
      fieldCaption: t("general.debit"),
      fieldType: "price",
      visibility: { kind: 'always' },
      onChange: (tableKey, rowId, row, controller) => {
        controller.dispatch({ type: 'UI_CELL_CHANGE', value: 0, rowId, columnId: "Bes" })
      },
      order: 14,
    },
    {
      fieldName: "Bes",
      fieldCaption: t("general.credit"),
      fieldType: "price",
      visibility: { kind: 'always' },
      onChange: (tableKey, rowId, row, controller) => {
        controller.dispatch({ type: 'UI_CELL_CHANGE', value: 0, rowId, columnId: "Bed" })
      },
      order: 15,
    },
    {
      fieldName: "ReferNumber",
      fieldCaption: t("general.referNumber"),
      fieldType: "number",
      rules: [{ type: "number", min: 2, message: " 2 حداقل" }],
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "ReferNumber",
      },
      order: 16,
    },
    {
      fieldName: "ReferDate",
      fieldCaption: t("general.referDate"),
      fieldType: "date",
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "ReferDate",
      },
      order: 17,
    }, {
      fieldName: "CurrencyId",
      fieldCaption: t("general.currencyType"),
      fieldType: "selectOption",
      labelValue: "selectValue",

      order: 18,
      dynamicSource: {
        endpoint: "/api/sale/select/currency",
        repoViewId: 130065,
        // PagingInfo:{ PageRecordCount: 5000, PageNumber: 1 }
      },
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "CurrencyId",
      },
    },
    {
      fieldName: "CurrencyNumber",
      fieldCaption: t("general.currencyCount"),
      fieldType: "number",
      rules: [{ type: "number", min: 2, message: " 2 حداقل" }],
      order: 19,
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "CurrencyNumber",
      },
    },
    {
      fieldName: "Count",
      fieldCaption: t("general.countNumber"),
      fieldType: "number",
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "Count",
      },
      order: 20,
    },
    {
      fieldName: "FollowUpNumber",
      fieldCaption: t("general.followUpNumber"),
      fieldType: "text",
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "FollowUpNumber",
      },
      order: 21,
    },
    {
      fieldName: "InsuranceNumber",
      fieldCaption: t("general.insuranceNumber"),
      fieldType: "number",
      visibility: {
        kind: "whenRemoteFlag",
        sourceFieldName: "AccountId",
        flag: "InsuranceNumber",
      },
      order: 22,
    }
  ]
};



