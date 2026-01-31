import type { TextAreaProps } from 'antd/es/input';

import type { IFormFieldConfig } from '@type/elementType';

export interface IProps extends TextAreaProps {
  config?: IFormFieldConfig;
  ref?: any;
}
