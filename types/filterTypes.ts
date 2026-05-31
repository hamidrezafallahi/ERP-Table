import { IRequestConfig } from "./elementType";

export interface IFilterData {
  value: string | number;
  label: string;
  type:
    | "string"
    | "number"
    | "date"
    | "select"
    | "dynamicSelect"
    | "multiSelect"
    | "dynamicMultiSelect";
  options?: {
    caption: string;
    value: any;
  }[];
  dynamicValue?: IRequestConfig;
}
