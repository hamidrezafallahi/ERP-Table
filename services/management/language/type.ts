import type { IBaseDto } from "@services/base/type";

export interface ILanguage extends IBaseDto {
  LanguageId: number;
  LanguageDesc: string;
  Code: string;
  PlaceId: number;
  CreateDate: string;
  CreateUserId: number;
}

export interface IRequest {
  config: string;
}
