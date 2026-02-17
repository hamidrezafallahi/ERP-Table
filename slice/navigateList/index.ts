import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { IInitialPage } from "@slice/init/type";

const initialState: IInitialPage[] = [];
export const ConfigsReducer = createSlice({
  name: "navigateList",
  initialState,
  reducers: {
    setNavigateList: (
      state: IInitialPage[],
      action: PayloadAction<{ init: IInitialPage }>
    ) => {
      const { init } = action.payload;
      state.push(init);
    },
    removeNavigateListLastItem: (state: IInitialPage[]) => {
      state.pop();
    },
    resetNavigateList: () => initialState,
  },
});

export const {
  setNavigateList,
  removeNavigateListLastItem,
  resetNavigateList,
} = ConfigsReducer.actions;
export default ConfigsReducer.reducer;
