import { IAccount } from "@services/acc/account/type";
import type { IBaseDto } from "@services/base/type";

export interface ICash extends IBaseDto {
  HasBookMark: true;
  CashId: 0;
  CashCode: "string";
  CashDesc: "string";
  Inactive: true;
  OtherSideMode: 0;
  IsTankhah: true;
  CashMoeenId: 0;
  CommercialCheckMoeenId: 0;
  CommercialSaftehMoeenId: 0;
  TazminiCheckMoeenId: 0;
  TazminiSaftehMoeenId: 0;
  NonCommercialCheckMoeenId: 0;
  NonCommercialSaftehMoeenId: 0;
  BankMoeenId: 0;
  TazminiSaftehIssuanceMoeenId: 0;
  CurrencyAccountId: 0;
  GuaranteeAccountId: 0;
  OtherGuaranteeAccountId: 0;
  PlaceId: 0;
  CashMoeen: Partial<IAccount>;
  CommercialCheckMoeen: Partial<IAccount>;
  CommercialSaftehMoeen: Partial<IAccount>;
  TazminiCheckMoeen: Partial<IAccount>;
  TazminiSaftehMoeen: Partial<IAccount>;
  NonCommercialCheckMoeen: Partial<IAccount>;
  NonCommercialSaftehMoeen: Partial<IAccount>;
  BankMoeen: Partial<IAccount>;
  TazminiSaftehIssuanceMoeen: Partial<IAccount>;
  CurrencyAccount: Partial<IAccount>;
  GuaranteeAccount: Partial<IAccount>;
  OtherGuaranteeAccount: Partial<IAccount>;
}

export interface IRequest {
  config: string;
}
