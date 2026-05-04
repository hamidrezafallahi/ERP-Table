import moment from 'moment';

import { IDetailColumnConfig } from '@components/organisms/erp-table';
import { ItemType } from '@components/organisms/erp-table/engine/type';
import { IFormFieldConfig } from '@type/elementType';

export const formConfig: IFormFieldConfig[] = [

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
            console.log("الان بدهکار کلی هستی")
            if (rowBed >= rowBes) {//چک شد
              console.log("الان بدهکار کلی هستی  و در سطر هم بدهکاری")
              if (rowBed > sumDifference) {

                controller.dispatch({ type: 'UI_CELL_CHANGE', value: rowBed - sumDifference, rowId, columnId: "Bed" })
              } else {
                controller.dispatch({ type: 'UI_CELL_CHANGE', value: sumDifference - rowBed, rowId, columnId: "Bes" })
                controller.dispatch({ type: 'UI_CELL_CHANGE', value: 0, rowId, columnId: "Bed", })
              }
            } else {//چک شد
              console.log("الان بدهکار کلی هستی  و در سطر بستانکاری و بدهی کل بزرگتر از بستانکاری سطر هست")
              controller.dispatch({ type: 'UI_CELL_CHANGE', value: sumDifference + rowBes, rowId, columnId: "Bes", })
            }
          } else {
            console.log("الان بستانکار کلی هستی")
            if (rowBed >= rowBes) {
              console.log("الان بستانکار کلی هستی  و در سطر بدهکاری ")
              controller.dispatch({ type: 'UI_CELL_CHANGE', value: rowBed + sumDifference, rowId, columnId: "Bed", })
            } else { // چک شده 
              console.log("الان بستانکار کلی هستی  و در سطر هم بستانکاری")
              if (sumDifference >= rowBes) {
                console.log("ولی بستانکاری کل بزرگتر از بستانکاری سطر هست  الان بستانکار کلی هستی  و در سطر هم بستانکاری")
                controller.dispatch({ type: 'UI_CELL_CHANGE', value: sumDifference - rowBes, rowId, columnId: "Bed", })
                controller.dispatch({ type: 'UI_CELL_CHANGE', value: 0, rowId, columnId: "Bes", })
              } else {
                console.log(" ولی بستانکاری کل کوچکتر از بستانکاری سطر است الان بستانکار کلی هستی  و در سطر هم بستانکاری")
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
        // repoViewId: 130063
      },
      resolveOn: {
        fieldName: "AccountId",
        endpoint: "api/acc/select/account4voucher",
        buildParams: (row) => ({
          Id: Number(row.AccountId),
          repoViewId: 10001
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

      width: 144,
      popUpWidth: 400,
      labelValue: "selectValue",
      order: 2
    },
      {
      fieldName: "TafsiliId",
      fieldCaption: t("general.tafsili"),
      fieldType: "selectOption",
      dynamicSource: {
        endpoint: "/api/acc/select/tafsiliLevel4",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: { kind: "always" },
      order: 3
    },{
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "FifthId",
      },
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "SixthId",
      },
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "SeventhId",
      },
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "EightId",
      },
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "NineId",
      },
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "TenId",
      },
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "ElevenId",
      },
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "TwelveId",
      },
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "ThirteenId",
      },
      order: 12
    }, {
      fieldName: "DetailDesc",
      fieldCaption: t("general.rowDescription"),
      fieldType: "text",
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "ReferNumber",
      },
      order: 16,
    },
     {
      fieldName: "ReferDate",
      fieldCaption: t("general.ReferDate"),
      fieldType: "date",
      visibility: {
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "ReferDate",
      },
      order: 17,
    },{
      fieldName: "CurrencyId",
      fieldCaption: t("general.currencyType"),
      fieldType: "selectOption",
      order: 18,
      dynamicSource: {
        endpoint: "/api/inv/select/batch4SelectOptionByVoucherTypeId",
        repoViewId: 10017,
        dependsOn: ["AccountId"],
        dependOn: { fieldName: "AccountId", value: null }
      },
      visibility: {
        kind: "whenFlag",
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "CurrencyNumber",
      },
    },
    {
      fieldName: "Count",
      fieldCaption: t("general.countNumber"),
      fieldType: "number",
      visibility: {
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "Count",
      },
      order: 20,
    },
    {
      fieldName: "FollowUpNumber",
      fieldCaption: t("general.followUpNumber"),
      fieldType: "number",
      visibility: {
        kind: "whenFlag",
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
        kind: "whenFlag",
        sourceFieldName: "AccountId",
        flag: "InsuranceNumber",
      },
      order: 22,
    }
  ]
};



