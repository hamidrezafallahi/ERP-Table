export type TransferStatus = "تایید نهایی" | "عدم تایید" | "در انتظار";

export type TransferItem = {
  id: string;
  rowNumber: number;
  nameOrAccount: string;
  date: string; // example: "۱۴۰۲/۰۵/۱۱"
  time: string; // example: "۱۸:۱۸"
  status: TransferStatus;
  highlighted?: boolean;
};

export const sampleData: TransferItem[] = [
  {
    id: "1",
    rowNumber: 1,
    nameOrAccount: "مریم معصومی / 09121011212",
    date: "۱۴۰۳/۰۵/۰۱",
    time: "۱۰:۲۰",
    status: "تایید نهایی",
    highlighted: true,
  },
  {
    id: "2",
    rowNumber: 2,
    nameOrAccount: "رضا مرادی / 09121578989",
    date: "۱۴۰۳/۰۴/۲۵",
    time: "۰۹:۱۵",
    status: "عدم تایید",
  },
  {
    id: "3",
    rowNumber: 3,
    nameOrAccount: "علی حسینی / 09186586868",
    date: "۱۴۰۳/۰۳/۱۰",
    time: "۱۲:۴۵",
    status: "در انتظار",
  },
];
