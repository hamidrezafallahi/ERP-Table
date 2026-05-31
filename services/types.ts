import {
  QueryActionCreatorResult,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import { IBaseQueryResponse, IBaseRequest } from "./base/type";

export type RefetchType = () => QueryActionCreatorResult<
  QueryDefinition<
    {
      url: string;
      body: IBaseRequest<any>;
      id: number | string;
    },
    (args: any, api: any, extraOptions: any) => Promise<any>,
    string,
    IBaseQueryResponse<any>,
    "apiService"
  >
>;

export type ReloadType = () => QueryActionCreatorResult<
  QueryDefinition<
    {
      url: string;
      body: IBaseRequest<any>;
      id: number | string;
    },
    (args: any, api: any, extra: any) => Promise<any>,
    string,
    IBaseQueryResponse<any>,
    "apiService"
  >
>;
