export enum PageTypeEnum {
  List = 1,
  Form,
  NestedList,
  Custom,
  Report,
}
export enum MessageEnum {
  ErrorToast = "s01",
  SuccessToast = "s02",
  InfoToast = "s03",
  NotificationToast = "s04",
  ErrorMessage = "s05",
  SuccessMessage = "s06",
  InfoMessage = "s07",
  WarningMessage = "s08",
  LoadingMessage = "s09",
  DefaultMessage = "default",
}
export enum SystemEnum {
  "base" = 0,
  "sale" = 1,
  "inv" = 2,
  "trh" = 3,
  "salary" = 4,
  "acc" = 5,
  "buy" = 8,
  "hr" = 9,
  "report" = 10,
  "com" = 106,
  "gateway" = 200,
  "notif" = 201,
  "file" = 202,
  "cmt" = 203,
  "auth" = 204,
  "job" = 205,
  "bpms" = 206,
  "mng" = 207,
  "logs" = 208,
}

export enum ChequeState {
  AtTheBank = 1,
  AtTheCash,
  Passed,
  AtThePerson,
  AtTheCashFund,
  Reversal
}
export enum eChequePrommisoryType {
  Cheque = 1,
  Promissory
}