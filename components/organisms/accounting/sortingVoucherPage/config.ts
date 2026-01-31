import { VoucherSortTypeEnum } from "@services/acc/voucher/type";
import type { IFormFieldConfig } from "@type/elementType";

export const formConfig: IFormFieldConfig[] = [
  {
    name: "Date",
    caption: "تا تاریخ",
    type: "date",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "SortType",
    caption: "نوع",
    type: "radio",
    value: VoucherSortTypeEnum.ByCreateTime,
    radioValues: [
      {
        caption: "زمان ثبت سند",
        value: VoucherSortTypeEnum.ByCreateTime,
      },
      {
        caption: "تاریخ سند",
        value: VoucherSortTypeEnum.ByVoucherDate,
      },
      {
        caption: "تاریخ سند / ساعت ثبت سند",
        value: VoucherSortTypeEnum.ByDateThenCreateTime,
      },
    ],
    originalValue: undefined,
    isTitleField: false,
  },
];
