import { ChangeEvent } from "react";

import { InputProps } from "antd";
import { IFormFieldConfig } from "@type/elementType";

export interface IProps extends InputProps {
  className?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  config?:IFormFieldConfig
}
