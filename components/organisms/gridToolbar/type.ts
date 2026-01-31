import type { IViewData } from "@slice/pages/type";
import type { IToolbarDetailConfig } from "@type/toolbar";

export interface IProps {
  config: IToolbarDetailConfig[];
  viewData: IViewData;
  rowFieldKey: string;
  rangeFilterKey?: string | null;
}
