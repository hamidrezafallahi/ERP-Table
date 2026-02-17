import { IDetail } from '@services/generalType/type';

export interface IVoucherDetails extends IDetail {
  VoucherDetailId?: number;
  AccountId: number;
  DetailDesc: string;
  Bed: number;
  Bes: number;
  TafsiliId?: number;
  FifthId?: number;
  SixthId?: number;
  SeventhId?: number;
  EightId?: number;
  NineId?: number;
  TenId?: number;
  ElevenId?: number;
  TwelveId?: number;
  ThirteenId?: number;
  Levels?: ILevel[];
  CurrencyId?: number;
  CurrencyRate?: number;
  CurrencyNumber?: string;
  FollowUpDate?: string;
  FollowUpNumber?: string;
  Count?: number;
  ReferNumber?: string;
  InsuranceNumber?: string;
}

export interface ILevel {
  desc: string;
  Level: number;
}

export interface IVoucherDetailsRequest {
  config: string;
}
