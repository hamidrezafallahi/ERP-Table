import type { IFormFieldConfig } from "@type/elementType";

export interface IProps {
  config?: IFormFieldConfig;
  ref?: any;
  onChange?: (e: number) => void;
  className?: string;
}
