import { CheckDocumentOperationType } from "@components/templates/treasury/receiptAndPayment/cheque&promissoryNote/enum";

export const levelFieldMap = [
  {
    name: "CashId",
    label: "صندوق",
    caption: "Caption",
    configKey: "cashConfig",
    conditionKey: "cash",
  },
  {
    name: "RpWayId",
    label: "روش دریافت/پرداخت",
    caption: "Caption",
    configKey: "rpWayConfig",
    conditionKey: "rpWay",
  },
  {
    name: "NatureId",
    label: "ماهیت",
    caption: "Caption",
    configKey: "natureConfig",
    conditionKey: "nature",
  },
];

export const voucherTypeMap: Partial<
  Record<CheckDocumentOperationType, number>
> = {
  [CheckDocumentOperationType.ReceiveCheck]: 6020,
  [CheckDocumentOperationType.ReceivePromissoryNote]: 70004,
  [CheckDocumentOperationType.DeployCheck]: 70008,
  [CheckDocumentOperationType.DeployPromissoryNote]: 70005,
};
