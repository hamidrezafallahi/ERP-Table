import type { IBaseDto } from "@services/base/type";

export interface IPerson extends IBaseDto {
  UsedCount: number;
  UsedSum: number;
  HasAccess: boolean;
  TimestampBase64String: string;
  PendingStatusId: number;
  PersonId: number;
  PersonTypeId: PersonTypeEnum;
  PersonCode: string;
  PersonTitle: string;
  FirstName: string;
  IdentitySerial: string;
  IsCivilPartnership: boolean;
  LastName: string;
  FullName: string;
  IsForeign: boolean;
  FatherName: string;
  NationalIdentity?: string;
  NationalCode?: string;
  EconomicCode?: string;
  Female: boolean;
  IdentityNumber: string;
  RegisterNumber: string;
  PersianBirthDate: string;
  BirthDate: string;
  IsPerson: boolean;
  PlaceId: number;
  TafsiliId: number;
  Place?: any;
  Contacts?: any;
  Related?: any;
  PersonContactView?: any;
  BirthLocationId: number;
  RegisterLocationId: number;
  Tafsili?: any;
  BirthLocation?: any;
  RegisterLocation?: any;
  Sex: SexEnum;
  PassportNumber: string;
  DisplayName: string;
  ForeignLocationId: number;
  PersonTypeDesc: string;
  Location?: any;
  PersonType: PersonTypeEnum;
}

export enum PersonTypeEnum {
  Person = 1,
  Company = 2,
  Foreign = 3,
}

export enum SexEnum {
  Male = 0,
  Female = 1,
}

export interface IRequest {
  config: string;
}
