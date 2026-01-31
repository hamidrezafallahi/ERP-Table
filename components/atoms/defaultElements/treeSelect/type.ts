import { Dispatch } from 'react';

import {
  FormInstance,
  TreeSelectProps,
} from 'antd';

import { IInitialPage } from '@slice/init/type';
import type { IFormFieldConfig } from '@type/elementType';

export interface IProps extends TreeSelectProps {
  config?: IFormFieldConfig;
  ref?: any;
  form?: FormInstance;
  searchPhrase?: any;
  setSearchPhrase?: Dispatch<any>;
  handleScroll?: (e: any) => void;
  addButton?: IInitialPage;
  handleRefetch?: () => void;
  isFetching?: boolean;
}
