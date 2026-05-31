import { ReloadType } from "@services/types";
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

export type VoucherDataType = {
  _SelectId: number;
  _SelectValue: number[];
  _SelectDisplay: string;
};

export type TFunction = ReturnType<typeof useTranslations>;

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
