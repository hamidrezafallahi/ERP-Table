import type { IMenuItem } from '@type/elementType';

export interface IProps {

  minimize?: boolean;
}
export type FilteredResult = {
  filteredItems: IMenuItem[];
  defaultExpandedKeys: string[];
};
