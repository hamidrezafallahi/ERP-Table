import IResponseItem, {
  RecordType,
} from "@components/organisms/sideBarForm/types";

export interface ITafsiliCategoryItem extends IResponseItem {
  TafsiliCategoryItemId: number;
  TafsiliCategoryId: number;
  TafsiliId: number;
  Tafsili?: {
    TafsiliId: number;
    TafsiliDesc: string;
  };
}

interface RecordTypeTafsili extends RecordType {
  Tafsili: {
    DisablePending: boolean;
    GetEntityId: number;
    IsSystem: boolean;
    TafsiliDesc: string;
    TafsiliId: number;
  };
  TafsiliCategoryId: number;
  TafsiliCategoryItemId: number;
  TafsiliDesc: string;
  TafsiliId: number;
}
