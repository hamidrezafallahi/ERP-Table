import { UserSession } from '@services/auth/base/type';

export type TLang = "fa" | "en";
export type TTheme = "light" | "dark";
export interface IDefaultConfigs {
  CurrencyId: { id: number; desc: string };
  CashierId: { id: number; desc: string };
  PlaceId: { id: number; desc: string };
  YearId: { id: number; desc: string };
  LanguageId: { id: number; desc: string };
  ManagementAccountId?: { id: number; desc: string };
}

export interface IConfig {
  lang: TLang;
  direction: "rtl" | "ltr";
  fullScreen: boolean;
  modalIsFullscreen: boolean;
  menuBar: { value: number; label: string };
  progressItems: { id: string; percent: number }[];
  parentPageId: string;
  theme: TTheme;
  userSession: UserSession;
  defaultConfigs: IDefaultConfigs;
  initMatch: boolean;
  reportData: {
    dataSourceName: string;
    data: any[];
  }[];
}
