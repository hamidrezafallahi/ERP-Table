import type { InputProps } from "antd";

import type { IFormFieldConfig } from "@type/elementType";

export interface IProps extends InputProps {
  config?: IFormFieldConfig;
  ref?: any;
}
