import type { INestedListConfig } from "@components/organisms/nestedList/type";

export interface IProps<T> {
  id: number | null;
  onGetDefault?:(e:any)=>void
  fatherId: number | null;
  level: number;
  onClose: () => void;
  config: INestedListConfig;
}
