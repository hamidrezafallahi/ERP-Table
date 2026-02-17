import type { IBaseDto } from '@services/base/type';

export interface IContactInfo extends IBaseDto {
  ContactType: { CommonDesc: "آدرس" };
  CreateDate: "2025-07-12T11:24:31.609+00:00";
  Location: {
    FatherLocationId: number;
    GetEntityId: number;
    LocationDesc: string;
    LocationId: number;
  };
  PersonContactId: number;
  PersonId: number;
  ContactTypeId?: number;
  ContactInfo?: string;
  IsDefault?: boolean;
  ContactDesc?: string;
  LocationId?: number;
  FatherLocationId?: number;
  LocationDesc?: string;
  PostalCode?: number;
  Lat?: number;
  Lon?: number;
}

export interface IRequest {
  config: string;
}

export interface IContactInfoSelect extends IBaseDto {
  Type: number;
  ContactTypeId?: number;
}
