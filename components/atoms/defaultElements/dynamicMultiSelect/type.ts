import type { FormInstance, SelectProps } from "antd";

import type { IFormFieldConfig, IRequestConfig } from "@type/elementType";

export interface IProps extends SelectProps {
  dynamicValue: IRequestConfig;
  selectedId?: number;
  config?: IFormFieldConfig;
  form?: FormInstance;
}
