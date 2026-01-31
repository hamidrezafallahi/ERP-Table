import type { InputNumberProps } from 'antd/lib';

import type { IFormFieldConfig } from '@type/elementType';

export interface IProps extends InputNumberProps {
  config?: IFormFieldConfig;
}
