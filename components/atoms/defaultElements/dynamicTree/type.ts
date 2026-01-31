import type { TreeSelectProps } from "antd";

import type {
  IFormFieldConfig,
  IOption,
  IRequestConfig,
} from "@type/elementType";

export interface IProps extends TreeSelectProps {
  dynamicValue: IRequestConfig;
  selectedId?: number;
  showId?: boolean;
  config?: IFormFieldConfig;
  onSearchPhrase?: (
    currentOptionValue: number,
    currentOptionLabel?: string
  ) => void;
  onOptionsChange?: (options: IOption[]) => void;
  showIdInDesc?: boolean;
}
