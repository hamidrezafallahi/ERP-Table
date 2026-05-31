export type CashBalanceResponse = {
  CashBalance: AccountBalanceItemType[];
};

export type AccountBalanceItemType = {
  CurrencyName: string;
  TotalAmount: number;
};
