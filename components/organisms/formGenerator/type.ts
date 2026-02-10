import { Dispatch, SetStateAction } from "react";

export interface IProps {
  caption: string;
  fieldKey: string;
  titleKey: string | string[];
  listUrl: string;
  url: string;
  pageIcon?: string;
  conditionalActions?: {
    conditionalProperty: string;
    conditionallyAction?: string;
  }[];
  isModal?: boolean;
  parentPageId?: string;
  mutationSystemId?: number;
  conditionalFields?: any[] | boolean;
  setConditionalFields?: Dispatch<SetStateAction<any[]>>;
  extraFunction?: (x: any) => void;
  withImage?: boolean;
  submitCaption?: string;
  withSubmitButton?: boolean;
}
