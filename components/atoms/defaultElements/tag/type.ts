import type { TagProps } from 'antd';

import type { ITagInfo } from '@services/base/type';

export interface IProps extends TagProps {
  tag: ITagInfo;
  deleteTagHandler?: (e: any) => void;
  selectTagHandler?: (e: any) => void;
  Loading?: boolean;
  closable?: boolean;
}
