import { IRequestConfig } from '@type/elementType';

interface FieldRule {
  required?: boolean;
  message?: string;
  type?: "string" | "boolean" | "number";
  len?: any;
  pattern?: any;
}

interface FormField {
  name: string;
  caption?: string;
  help?: string;
  type:
    | "selectOption"
    | "text"
    | "checkbox"
    | "date"
    | "number"
    | "treeOption"
    | "price"
    | "info";
  showId?: boolean;
  rules?: FieldRule[];
  selectEndpoint?: IRequestConfig;
  placeHolder?: string;
  order?: number;
  defaultValue?: boolean;
}

export interface IChequeDynamicConfig {
  deleteUrl: string;
  createUrl: string;
  updateUrl: string;
  voucherTypeId: number;
  conditionalFields?: boolean;
  alternativeKey?: string;
  alternativeFindKey?: string;
  alternativeErr?: string;
  formFields: FormField[];
}

export interface IProps {
  sourceKey: string;
  sourceId: {
    DocumentChequeId: number;
    RowNum: number;
  }[];
  handleClose: () => void;
  config: IChequeDynamicConfig;
  selectedRecords: any;
}
