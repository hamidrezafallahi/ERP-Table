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
    {
      fieldName: "CurrencyId",
      fieldCaption: "ارز",
      fieldType: "selectOption",
      selectEndpoint: {
        addWebUrl: "/api/sale/select/currencyAvailable",
        endpoint: "/api/sale/select/currencyAvailable",
        repoViewId: 130076,
      },
      order: 7,
    },
  ],
};
