import {
  createSlice,
  PayloadAction,
  Slice,
} from '@reduxjs/toolkit';
import { UserSession } from '@services/auth/base/type';

import type {
  IConfig,
  IPlaceConfig,
  TLang,
  TTheme,
} from './type';

const initialState: IConfig = {
  fullScreen: false,
  modalIsFullscreen: false,
  reportData: [],
  initMatch: false,
  userSession: {
    UserInfo: {
      UserName: "",
      UserPic: "",
      UserType: 0,
      PackageId: null,
      UserId: 0,
      IsAdmin: false,
    },
    RoleDto: [],
    ManagementAccounts: [],
  },
  lang: "fa",
  direction: "rtl",
  menuBar: { value: null, label: null },
  progressItems: [],
  parentPageId: "",
  theme: "light",
  defaultConfigs: null,
  placeConfigs:[]
};

export const ConfigsReducer: Slice<IConfig> = createSlice({
  name: "pageConfig",
  initialState,
  reducers: {
    setFullScreen: (state, action: PayloadAction<{ fullScreen: boolean }>) => {
      state.fullScreen = action.payload.fullScreen;
    },
    setReportData: (
      state,
      action: PayloadAction<{ dataSourceName: string; reportData: any[] }>,
    ) => {
      const { reportData, dataSourceName } = action.payload;
      const existing = state.reportData.find(
        (item) => item.dataSourceName === dataSourceName,
      );
      if (existing) {
        existing.data = reportData;
      } else {
        state.reportData.push({ dataSourceName, data: reportData });
      }
    },
    clearReportData: (
      state,
      action: PayloadAction<{ dataSourceName?: string } | undefined>,
    ) => {
      const dataSourceName = action?.payload?.dataSourceName;
      if (dataSourceName) {
        state.reportData = state.reportData.filter(
          (item) => item.dataSourceName !== dataSourceName,
        );
      } else {
        state.reportData = [];
      }
    },
    setModalIsFullScreen: (
      state,
      action: PayloadAction<{ fullScreen: boolean }>,
    ) => {
      state.modalIsFullscreen = action.payload.fullScreen;
    },
    setProgressbar: (
      state,
      action: PayloadAction<{ id: string; percent: number }>,
    ) => {
      const { id, percent } = action.payload;
      state.progressItems = [
        ...state.progressItems.filter((item) => item.id !== id),
        { id, percent },
      ];
    },
    setUserSession: (
      state,
      action: PayloadAction<{ userSession: UserSession }>,
    ) => {
      state.userSession = action.payload.userSession;
    },
    setGlobalAndView: (
      state,
      action: PayloadAction<{ direction: IConfig["direction"]; lang: TLang }>,
    ) => {
      state.lang = action.payload.lang;
      state.direction = action.payload.direction;
    },
    setLanguage: (state, action: PayloadAction<{ lang: TLang }>) => {
      state.lang = action.payload.lang;
    },
    setMenuBar: (
      state,
      action: PayloadAction<{ menuBar: { value: number; label: string } }>,
    ) => {
      state.menuBar = action.payload.menuBar;
    },
    setParentPageId: (
      state,
      action: PayloadAction<{ parentPageId: string }>,
    ) => {
      state.parentPageId = action.payload.parentPageId;
    },
    setDefaultConfig: (
      state,
      action: PayloadAction<Partial<IConfig["defaultConfigs"]>>,
    ) => {
      state.defaultConfigs = { ...state.defaultConfigs, ...action.payload };
    },
    setTheme: (state, action: PayloadAction<{ theme: TTheme }>) => {
      state.theme = action.payload.theme;
    },
    setInitMatch: (state, action: PayloadAction<{ match: boolean }>) => {
      state.initMatch = action.payload.match;
    },

    mergeConfig: (state, action: PayloadAction<Partial<IConfig>>) => {
      const incoming = action.payload;
      if (!incoming || typeof incoming !== "object") return;
      Object.entries(incoming).forEach(([key, value]) => {
        if (key in state) {
          state[key] = value;
        }
      });
    },
     setPlaceConfigs: (state, action: PayloadAction<{ placeConfigs:IPlaceConfig[]  }>) => {
          state.placeConfigs = action.payload.placeConfigs;
        },
    resetConfig: (state) => {
      return {
        ...state,
        userSession: {
          ...state.userSession,
          UserInfo: {
            UserName: "",
            UserPic: "",
            UserType: 0,
            PackageId: null,
            UserId: 0,
            IsAdmin: false,
          },
        },
      };
    },
    fullConfigReset: () => initialState,
  },
});

export const {
  setFullScreen,
  setGlobalAndView,
  setProgressbar,
  setMenuBar,
  setParentPageId,
  setLanguage,
  resetConfig,
  fullConfigReset,
  setTheme,
  setUserSession,
  setDefaultConfig,
  setModalIsFullScreen,
  setReportData,
  clearReportData,
  setInitMatch,
  mergeConfig,
  setPlaceConfigs
} = ConfigsReducer.actions;

export default ConfigsReducer.reducer;
