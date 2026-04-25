import { IBaseDto } from "@services/base/type";

export interface ToolbarInfoProps {
  fromFieldName?: string;
  toFieldName?: string;
  onChange: (from: string, to: string) => void;
  isLoading?:boolean
}

export interface BankStatementRow extends IBaseDto {
  BankStatementId: number;
  VoucherTypeId: number;
  RpWayId: number;
  VoucherDate: string;
  VoucherDesc: string;
  YearId: number;
  BankAccountId: number;
  TafsiliId: number;
  Price: number;
  FishNumber?: string;
  TafsiliDesc?: string;
}
