import { IBaseQueryResponse } from "@services/base/type";

export interface ISelectTafsili {
  TafsiliCategoryDesc: string;
  TafsiliCategoryId: number;
}

export interface TafsiliCategoryListProps {
  listUrl: string;
  deleteUrl: string;
  repoViewId: number;
  tafsiliCategoryList:ISelectTafsili[]
}
