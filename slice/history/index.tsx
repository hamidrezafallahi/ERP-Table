import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";

import type { IHistory } from "./type";

const MAX_HISTORY = 5;

const initialState: IHistory[] = [];

export const HistoryReducer: Slice<
  IHistory[],
  {
    addHistory: (
      state: IHistory[],
      action: PayloadAction<IHistory>
    ) => IHistory[];
    clearHistory: (state: IHistory[]) => IHistory[];
  },
  "history"
> = createSlice({
  name: "history",
  initialState,
  reducers: {
    addHistory: (state, action: PayloadAction<IHistory>) => {
      const newState = [...state, action.payload];
      if (newState.length > MAX_HISTORY) {
        return newState.slice(newState.length - MAX_HISTORY);
      }
      return newState;
    },
    clearHistory: () => {
      return [];
    },
  },
});

export const { addHistory, clearHistory } = HistoryReducer.actions;
export default HistoryReducer.reducer;
