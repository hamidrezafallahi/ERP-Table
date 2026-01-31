export interface Currency {
  CurrencyId: number;
  CurrencyCode: string;
  CurrencyDesc: string;
  MoadianCode: string;
  IsBaseDesc: string;
  IsBase: boolean;
}

export interface IUserCUDResponse {
  InsertResults?: { IsInsert: boolean }[];
  DeleteResults?: { IsDelete: boolean }[];
}
