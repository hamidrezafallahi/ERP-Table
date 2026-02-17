import { PageTypeEnum } from "@type/enum";
import type { IToolbar } from "@type/toolbar";

export interface IRequestToolbarData {
  RepoId: number;
  Type: PageTypeEnum;
  SystemId: number;
  pageIndex?: number;
  Id?: number;
}
export interface IResponseToolbarData {
  Data: IToolbar;
  Result: boolean;
  StatusCode: string;
}
