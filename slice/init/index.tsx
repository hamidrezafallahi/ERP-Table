import {
  createSlice,
  PayloadAction,
  Slice,
} from '@reduxjs/toolkit';

import type { IInitialPage } from './type';

const initialState: IInitialPage = {
  RepoId: null,
  SystemId: null,
  url: "",
  pageId: null,
  pageState: null,
  originalPageState: null,
  Id: null,
  listPageId: null,
  selectedView: null,
  returnPageId: null,
  Key: null,
  caption: null,
  data: null,
};

export const InitReducer: Slice<IInitialPage> = createSlice({
  name: "init",
  initialState,
  reducers: {
    setInitialPageData: (
      state,
      action: PayloadAction<Partial<IInitialPage>>,
    ) => {
      const {
        RepoId,
        SystemId,
        url,
        pageId,
        pageState,
        originalPageState,
        Id,
        selectedView,
        listPageId,
        Key,
        returnPageId,
        data,
        caption,
      } = action.payload ?? {};
      state.RepoId = RepoId ?? null;
      state.SystemId = SystemId ?? null;
      state.data = data ?? null;
      state.url = url ?? "";
      state.pageId = pageId ?? null;
      state.pageState = pageState ?? null;
      state.originalPageState = originalPageState ?? null;
      state.Id = Id ?? null;
      state.selectedView = selectedView ?? null;
      state.listPageId = listPageId ?? null;
      state.returnPageId = returnPageId ?? null;
      state.Key = Key ?? Id ?? null;
      state.caption = caption ?? null;
    },

    resetInit: () => initialState,
  },
});

export const { setInitialPageData, resetInit } = InitReducer.actions;
export default InitReducer.reducer;
