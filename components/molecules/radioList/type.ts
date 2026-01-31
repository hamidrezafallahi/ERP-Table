import { CSSProperties } from 'react';

import { RadioChangeEvent } from 'antd';
import { SelectProps } from 'antd/lib';

import type { IFormFieldConfig } from '@type/elementType';

export interface IProps {
  defaultValue?: any;
  value?: any;
  onChange?: (e: RadioChangeEvent) => void;
  size?: "large" | "middle" | "small";
  buttonStyle?: "outline" | "solid";
  disabled?: boolean;
  name?: string;
  options?: SelectProps["options"];
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  config?: IFormFieldConfig;
}

 
