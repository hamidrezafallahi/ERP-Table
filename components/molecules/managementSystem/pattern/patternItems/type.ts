import type { IPattern } from "@services/mng/pattern/type";
import type { IToolbarMenu } from "@type/toolbar";

export interface IProps {
  repoId: number;
  fieldKey: string;
  locale: string;
  handleActionClick: (
    action: IToolbarMenu,
    id: number,
    PendingStatusId: number | null
  ) => void;
  patterns: IPattern[];
  isFetching: boolean;
}
