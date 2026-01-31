import type { IPage } from "@slice/pages/type";

export interface ICondition {
  HasTafsili: boolean;
  HasFifth: boolean;
  HasSixth: boolean;
  HasSeventh: boolean;
  HasEight: boolean;
  HasNine: boolean;
  HasTen: boolean;
  HasEleven: boolean;
  HasTwelve: boolean;
  HasThirteen: boolean;
}
export interface IProps {
  activePage: IPage;
  form: any;
}
