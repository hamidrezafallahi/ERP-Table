import { IDetailColumnConfig } from "@components/organisms/erp-table";
import { ItemType } from "@components/organisms/erp-table/engine/type";
import { IFormFieldConfig } from "@type/elementType";

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
  },
  {
    name: "VoucherNumber",
    caption: "شماره",
    type: "number",
  },
  {
    name: "CustomerId",
    caption: "مشتری",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/inv/select/stock4SelectOption",
      endpoint: "/api/inv/select/stock4SelectOption",
      repoViewId: 70004,
    },
  },
  {
    name: "VoucherDesc",
    caption: "توضیحات",
    type: "text",
  },
];
const items: ItemType[] = [
  { key: "copy", label: "copy label", icon: "RedTrashBin" },
  { key: "delete", label: "delete label", icon: "RedTrashBin" },
];

export const columnConfig = (CustomerId): IDetailColumnConfig[] => {
  return [
    {
      fieldName: "index",
      fieldCaption: " ردیف - عملیات",
      fieldType: "index",
      order: 1,
      visibility: { kind: "always" },
      indexOptions: (tableKey, rowId, row, controller) => {
        return [
          {
            key: "qwe",
            label: "آپشن تست 1",
            onClick: () => {
              controller.dispatch({
                type: "UI_CELL_CHANGE",
                value: 125,
                rowId,
                columnId: "Quantity1",
              });
              console.log(tableKey, rowId, row);
            },
          },
          {
            key: "asd",
            label: tableKey,
            onClick: () => {
              console.log(tableKey, rowId, row);
            },
          },
        ];
      },
    },
    {
      fieldName: "GoodsId",
      fieldCaption: "کالا",
      fieldType: "selectOption",
      visibility: { kind: "always" },
      order: 2,
      dynamicSource: {
        endpoint: "api/sale/select/goods4selectOption/elk",
        repoViewId: 130063,
      },
    },
    {
      fieldName: "MeasureUnitId",
      fieldCaption: "واحد شمارش",
      fieldType: "selectOption",
      order: 3,
      visibility: { kind: "always" },
      dynamicSource: {
        endpoint: "api/sale/select/measureUnit4SelectOption",
        dependsOn: ["GoodsId"],
        dependOn: { fieldName: "GoodsId", value: null },
      },
    },
    {
      fieldName: "Quantity",
      fieldCaption: "تعداد",
      fieldType: "number",
      order: 4,
      visibility: { kind: "always" },
    },
    {
      fieldName: "Fee",
      fieldCaption: "فی کالا",
      fieldType: "number",
      order: 5,
      visibility: { kind: "always" },
      computed: {
        dependsOn: ["Quantity"],
        compute: async (row, remoteApi) => {
          if (!row?.GoodsId || !row?.Quantity || !CustomerId) {
            return 0;
          }
          const res = await remoteApi?.request({
            endpoint: "api/sale/select/invoiceDetail/additionalItems",
            params: {
              GoodsId: row.GoodsId,
              Quantity1: row.Quantity,
              RepoViewId: 130007,
              RowNum: row.index,
              Unit1Id: row.Unit1Id,
              CustomerId: CustomerId,
            },
          });
          return res?.Data?.[0]?.Fee ?? 0;
        },
      },
    },
    {
      fieldName: "Total",
      fieldCaption: "جمع",
      fieldType: "number",
      order: 6,
      visibility: { kind: "always" },
      computed: {
        dependsOn: ["Fee", "Quantity"],
        compute: async (row) => {
          const fee = typeof row.Fee === "number" ? row.Fee : 0;
          const quantity = typeof row.Quantity === "number" ? row.Quantity : 0;
          return fee * quantity;
        },
      },
    },
  ];
};
