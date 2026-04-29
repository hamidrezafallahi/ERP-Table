import { Ref } from 'react';

import type {
  FormInstance,
  SelectProps,
} from 'antd';

import type {
  IFormFieldConfig,
  IOption,
  IRequestConfig,
} from '@type/elementType';

export interface IProps extends SelectProps {
  dynamicValue: IRequestConfig & {dependsOn?:string[]};
  showId?: boolean;
  selectedId?: number;
  infinite?: boolean;
  config?: IFormFieldConfig;
  selectFirstDefault?: boolean;
  ref?: Ref<HTMLSelectElement>;
  onSearchPhrase?: (
    correctOptionValue: number,
    correctOptionTitle?: string,
    option?: unknown
  ) => void;
  onOptionsChange?: (options: IOption[]) => void;
  form?: FormInstance;
  labelValue?:'selectDisplay'|'selectValue';
}
