export interface IUserInfoResponse {
  Person: {
    FirstName: string;
    LastName: string;
  };
  UserId: number;
}
export interface IRequest {
  config: string;
}
