export const defaultListConfig = {
  repoViewId: null,
  selectUrl: "api/sale/select/invoiceSettlement",
  column: [
    {
      fieldName: "RpWay.RPWayDesc",
      fieldCaption: "نحوه",
      fieldType: "string",
      order: 2,
    },
    {
      fieldName: "PaymentAmount",
      fieldCaption: "مبلغ",
      fieldType: "price",
      order: 5,
    },
    {
      fieldName: "VoucherDesc",
      fieldCaption: "شرح",
      fieldType: "string",
      order: 6,
    },
  ],
};
