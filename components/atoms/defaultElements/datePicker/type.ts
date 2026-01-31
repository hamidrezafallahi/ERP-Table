import { DatePickerProps } from "antd";

import type { IFormFieldConfig } from "@type/elementType";

export interface IProps extends DatePickerProps {
  config?: IFormFieldConfig;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  highlightColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}
