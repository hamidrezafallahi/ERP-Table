import { Dispatch } from 'react';

import { FormInstance } from 'antd';
import type { SelectProps } from 'antd/lib';

import { IInitialPage } from '@slice/init/type';
import type { IFormFieldConfig } from '@type/elementType';

export interface IProps extends SelectProps {
  config?: IFormFieldConfig;
  ref?: any;
  form?: FormInstance;
  searchPhrase?: any;
  setSearchPhrase?: Dispatch<any>;
  handleScroll?: (e: any) => void;
  addButton?: IInitialPage;
  handleRefetch?: () => void;
  isFetching?: boolean;
  showRefetch?: boolean;
}
