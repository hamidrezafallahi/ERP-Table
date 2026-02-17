import {
  filterTypeDateEnum,
  filterTypeNumberEnum,
  filterTypeStringEnum,
} from "@services/base/type";

export const stringFilterTypeOptions: {
  label: string;
  title: string;
  value: filterTypeStringEnum;
}[] = [
  {
    label: "شامل",
    title: "شامل",
    value: filterTypeStringEnum.Contains,
  },
  {
    label: "برابر با",
    title: "برابر با",
    value: filterTypeStringEnum.Equal,
  },
  {
    label: "مخالف با",
    title: "مخالف با",
    value: filterTypeStringEnum.NotEqual,
  },
  {
    label: "شروع با",
    title: "شروع با",
    value: filterTypeStringEnum.StartWith,
  },
  {
    label: "پایان با",
    title: "پایان با",
    value: filterTypeStringEnum.EndWith,
  },

  {
    label: "خالی باشد",
    title: "خالی باشد",
    value: filterTypeStringEnum.IsNull,
  },

  {
    label: "خالی نباشد",
    title: "خالی نباشد",
    value: filterTypeStringEnum.NotNull,
  },
];

export const dateFilterTypeOptions: {
  label: string;
  title: string;
  value: filterTypeDateEnum;
}[] = [
  {
    label: "برابر با",
    title: "برابر با",
    value: filterTypeDateEnum.Equal,
  },
  {
    label: "مخالف با",
    title: "مخالف با",
    value: filterTypeDateEnum.NotEqual,
  },
  {
    label: "بزرگ تر از",
    title: "بزرگ تر از",
    value: filterTypeDateEnum.GreaterThan,
  },
  {
    label: "بزرگ تر یا مساوی با",
    title: "بزرگ تر یا مساوی با",
    value: filterTypeDateEnum.GreaterThanOrEqual,
  },
  {
    label: "کوچک تر از",
    title: "کوچک تر از",
    value: filterTypeDateEnum.LessThan,
  },
  {
    label: "کوچک تر یا مساوی با",
    title: "کوچک تر یا مساوی با",
    value: filterTypeDateEnum.LessThanOrEqual,
  },
  {
    label: "خالی باشد",
    title: "خالی باشد",
    value: filterTypeDateEnum.IsNull,
  },
  {
    label: "خالی نباشد",
    title: "خالی نباشد",
    value: filterTypeDateEnum.NotNull,
  },
];

export const numberFilterTypeOptions: {
  label: string;
  title: string;
  value: filterTypeNumberEnum;
}[] = [
  {
    label: "برابر با",
    title: "برابر با",
    value: filterTypeNumberEnum.Equal,
  },
  {
    label: "مخالف با",
    title: "مخالف با",
    value: filterTypeNumberEnum.NotEqual,
  },
  {
    label: "بزرگ تر از",
    title: "بزرگ تر از",
    value: filterTypeNumberEnum.GreaterThan,
  },
  {
    label: "بزرگ تر یا مساوی با",
    title: "بزرگ تر یا مساوی با",
    value: filterTypeNumberEnum.GreaterThanOrEqual,
  },
  {
    label: "کوچک تر از",
    title: "کوچک تر از",
    value: filterTypeNumberEnum.LessThan,
  },
  {
    label: "کوچک تر یا مساوی با",
    title: "کوچک تر یا مساوی با",
    value: filterTypeNumberEnum.LessThanOrEqual,
  },
  {
    label: "خالی باشد",
    title: "خالی باشد",
    value: filterTypeNumberEnum.IsNull,
  },
  {
    label: "خالی نباشد",
    title: "خالی نباشد",
    value: filterTypeNumberEnum.NotNull,
  },
];

export const selectFilterTypeOptions: {
  label: string;
  title: string;
  value: filterTypeNumberEnum;
}[] = [
  {
    label: "برابر با",
    title: "برابر با",
    value: filterTypeNumberEnum.Equal,
  },
  {
    label: "مخالف با",
    title: "مخالف با",
    value: filterTypeNumberEnum.NotEqual,
  },
];
