import { IDetailColumnConfig } from '@components/organisms/erp-table';
import { ItemType } from '@components/organisms/erp-table/engine/type';
import { IFormFieldConfig } from '@type/elementType';

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "number",
    value: undefined,
    originalValue: undefined
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
    value: undefined,
    originalValue: undefined
  },
  {
    name: "StockId",
    caption: "نام انبار",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/inv/select/stock4SelectOption",
      endpoint: "/api/inv/select/stock4SelectOption",
      repoViewId: 70004,
    },
    value: undefined,
    originalValue: undefined
  },
  {
    name: "InvoiceHeaderId",
    caption: "فاکتور مرجع",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/select/invoice4selectOption/elk",
      endpoint: "api/sale/select/invoice4selectOption/elk",
      // repoViewId: 1052,
    },
    isTitleField: true,
    value: undefined,
    originalValue: undefined
  },

  {
    name: "Details",
    caption: "اقلام سند",
    type: "array",
    value: [],
    originalValue: [],
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

export const columnConfig = (vti: string, internal: boolean, NeedReference: boolean, stockId: string, InvoiceHeaderId: string): IDetailColumnConfig[] => {
  return [
    {
      fieldName: "index",
      fieldCaption: " ردیف - عملیات",
      fieldType: "index",
      order: 1,
      visibility: { kind: 'always' },
      indexOptions: (tableKey, rowId, row, controller) => {
        return [
          {
            key: "qwe", label: ('آپشن تست 1'), onClick: () => {
              controller.dispatch({ type: 'UI_CELL_CHANGE', value: 125, rowId, columnId: "Quantity1", })
              console.log(tableKey, rowId, row)
            }
          },
          { key: "asd", label: (tableKey), onClick: () => { console.log(tableKey, rowId, row) } }
        ]
      },
    },
    {
      fieldName: "GoodsId",
      fieldCaption: "کالا",
      fieldType: "selectOption",
      visibility: { kind: 'always' },
      order: 2,
      dynamicSource: {
        endpoint: NeedReference ? "api/inv/select/voucher/goods4SelectOption" : "api/sale/select/goods4SelectOption/elk",
        VoucherHeaderId: NeedReference ? InvoiceHeaderId : null,
        repoViewId: NeedReference ? null : 130063
      },
      resolveOn: {
        fieldName: "GoodsId",
        endpoint: "api/inv/check/isLocationAble",
        buildParams: (row) => ({
          goodsId: Number(row.GoodsId),
          stockId: Number(stockId)
        }),
        mapFlags: (res) => {
          return {
            HasBatchId: res.Data[0].HasBatch && internal && NeedReference,
            HasBatchNum: res.Data[0].HasBatch && internal && res.Data[0].IsSimpleGood,
            HasExpireDate: res.Data[0].HasExpireDate,
            HasLocation: res.Data[0].HasLocation,
          }
        },
      },
    },
    {
      fieldName: "Unit1Id",
      fieldCaption: "واحد شمارش 1",
      fieldType: "selectOption",
      order: 3,
      visibility: { kind: 'always' },
      dynamicSource: {
        endpoint: "api/sale/select/measureUnit4SelectOption",
        dependsOn: ["GoodsId"],
        dependOn: { fieldName: "GoodsId", value: null }
      },
      // visibility: {
      //   kind: "whenFieldTruthy",
      //   fieldName: "GoodsId",
      // },
    },
    {
      fieldName: "Quantity1",
      fieldCaption: "تعداد 1",
      fieldType: "number",
      order: 4,
      visibility: { kind: 'always' },
      // colAccess: { denyRoles: ['VIEWER'],allowRoles:['ADMIN'],rule(ctx) {return false} }
      // visibility: {
      //   kind: "whenFieldTruthy",
      //   fieldName: "GoodsId",
      // },
    },
    // {
    //   fieldName: "Unit2Id",
    //   fieldCaption: "واحد شمارش 2",
    //   fieldType: "selectOption",
    //   order: 5,
    //   dynamicSource: {
    //     endpoint: "api/sale/select/measureUnit4SelectOption",
    //     dependsOn: ["GoodsId"],
    //     params: { GoodsId: 'GoodsId' },
    //   },
    //   visibility: {
    //     kind: "showUnitLevelConditionally",
    //     fieldName: "GoodsId",
    //   },
    // },
    // {
    //   fieldName: "Quantity2",
    //   fieldCaption: "تعداد 2",
    //   fieldType: "number",
    //   order: 6,
    //   visibility: {
    //     kind: "showUnitLevelConditionally",
    //     fieldName: "GoodsId",
    //   },
    // },
    // {
    //   fieldName: "Unit3Id",
    //   fieldCaption: "واحد شمارش 3",
    //   fieldType: "selectOption",
    //   order: 7,
    //   dynamicSource: {
    //     endpoint: "api/sale/select/measureUnit4SelectOption",
    //     dependsOn: ["GoodsId"],
    //     params: { GoodsId: 'GoodsId' },
    //   },
    //   visibility: {
    //     kind: "whenFieldTruthy",
    //     fieldName: "GoodsId",
    //   },
    // },
    // {
    //   fieldName: "Quantity3",
    //   fieldCaption: "تعداد 3",
    //   fieldType: "number",
    //   order: 8,
    //   visibility: {
    //     kind: "whenFieldTruthy",
    //     fieldName: "GoodsId",
    //   }, 
    // },
    {
      fieldName: "BatchId",
      fieldCaption: "آیدی بچ",
      fieldType: "selectOption",
      order: 9,
      dynamicSource: {
        endpoint: "/api/inv/select/batch4SelectOptionByVoucherTypeId",
        VoucherTypeId: vti,
        dependsOn: ["GoodsId"],//تغییر چه ستونی باعث واکشی اطلاعات جدید بشه 
        params: { VoucherTypeId: vti }, // چه پارامتر هایی از این سطر ارسال بشه  
      },
      visibility: {
        kind: "whenFlag",
        sourceFieldName: "GoodsId",
        flag: "HasBatchId",
      },
    },
    {
      fieldName: "BatchNo",
      fieldCaption: "بچ",
      fieldType: "text",
      order: 10,
      visibility: {
        kind: "whenFlag",
        sourceFieldName: "GoodsId",
        flag: "HasBatchNum",
      },
    },
    {
      fieldName: "ExpiryDate",
      fieldCaption: "تاریخ انقضا",
      fieldType: "date",
      order: 11,
      visibility: {
        kind: "whenFlag",
        sourceFieldName: "GoodsId",
        flag: "HasExpireDate",
      },
    },
    {
      fieldName: "InventoryLocationId",
      fieldCaption: "لوکیشن",
      fieldType: "selectOption",
      order: 12,
      dynamicSource: {
        endpoint: "api/inv/Select/StockLocation4SelectOption"
      },
      visibility: {
        kind: "whenFlag",
        sourceFieldName: "GoodsId",
        flag: "HasLocation",
      },
    },
    //   {
    //   fieldName: "TotalQty",
    //   fieldCaption: "جمع تعداد",
    //   fieldType: "number",
    //   order: 13,
    //   visibility: { kind: 'always' },
    //   computed: {
    //     dependsOn: ["Quantity1", "Quantity2", "Quantity3"],
    //     compute: async (row, remoteApi) => {

    //       // اگر واقعاً نیاز به API داری
    // //       const res = await remoteApi?.request<{ factor: number }>({
    // //         endpoint: '/calculate/factor',
    // //         params: { productId: row.ProductId },
    // //       });
    // // console.log(res)
    //       const q1 = Number(row.Quantity1 ?? 0);
    //       const q2 = Number(row.Quantity2 ?? 0);
    //       const q3 = Number(row.Quantity3 ?? 0);

    //       return (q1 + q2 + q3);
    //     },
    //   },
    // }

    // {
    //   fieldName: "FinalQtyStatus",
    //   fieldCaption: "وضعیت مقدار",
    //   fieldType: "static",
    //   order: 14,
    //   visibility: { kind: 'always' },
    //   displayFormat: (value) => {
    //     return `نمایشگر - ${value}`
    //   },
    //   computed: {
    //     dependsOn: ["TotalQty"],
    //     compute: (row) => {
    //       const total = Number(row.TotalQty ?? 0);
    //       if (total === 0) return "خالی";
    //       if (total < 10) return "کم";
    //       if (total < 100) return "متوسط";
    //       return "زیاد";
    //     },
    //   },
    // }

  ]
};




// {
//   fieldName: "TotalQty",
//   fieldCaption: "جمع تعداد",
//   fieldType: "number",
//   order: 12,
//   computed: {
//     dependsOn: ["Quantity1", "Quantity2", "Quantity3"],
//     compute: (row) => {
//       const q1 = Number(row.Quantity1 ?? 0);
//       const q2 = Number(row.Quantity2 ?? 0);
//       const q3 = Number(row.Quantity3 ?? 0);
//       return q1 + q2 + q3;
//     },
//   },
// }
// {
//   fieldName: "Children",
//   cell: ({ row }) => {
//     return row.getCanExpand() ? (
//       <button
//         onClick={row.getToggleExpandedHandler()}
//         style={{ cursor: "pointer" }}
//       >
//         {row.getIsExpanded() ? "👇" : "👉"}
//       </button>
//     ) : (
//       ""
//     );
//   },
// },