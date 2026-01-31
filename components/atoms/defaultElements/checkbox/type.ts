import { IFormFieldConfig } from "@type/elementType";
import { CheckboxProps } from "antd";

export interface IProps extends CheckboxProps{
    config?:IFormFieldConfig
}