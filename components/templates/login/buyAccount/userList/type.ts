export interface User {
  UserId: number;
  FullName: string;
  IsAdmin: boolean;
  PhoneNumber?: string;
}
export interface IUserCUDResponse {
  InsertResults?: { IsInsert: boolean }[];
  DeleteResults?: { IsDelete: boolean }[];
}
