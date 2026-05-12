import {
  QueryActionCreatorResult,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import { IBaseQueryResponse, IBaseRequest } from "@services/base/type";

import { FormInstance } from "antd";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

export interface IProps {
  id: number;
  sourceKey: string | number;
  additionalId?: number;
  additionalFieldKey?: string;
}

export default interface IResponseItem {}

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

export type TFunction = ReturnType<typeof useTranslations>;

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

export type RecordType = {
  Desc?: string;
  [key: string]: string | number | boolean | object | undefined;
};

export type CustomFormComponentProps = CustomFormBaseProps;
export interface CustomFormBaseProps {
  typeId: number;
  form: FormInstance<any>;
  editingRecord: RecordType;
  setEditingRecord: Dispatch<SetStateAction<RecordType>>;
  refetchCard: ReloadType;
  refetchTable: ReloadType;
}
