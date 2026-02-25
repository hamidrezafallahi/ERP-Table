import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { IItems } from "./type";

type PageId = string | number;

const initialState: IItems<PageId> = {
  itemsByPage: {},
};

const listItemSlice = createSlice({
  name: "listItems",
  initialState,
  reducers: {
    setItems: (
      state,
      action: PayloadAction<{ pageId: PageId; items: number[] }>,
    ) => {
      state.itemsByPage[action.payload.pageId] = action.payload.items;
    },

    resetItemsByPage: (state, action: PayloadAction<{ pageId: PageId }>) => {
      delete state.itemsByPage[action.payload.pageId];
    },

    resetAllItems: () => initialState,
  },
});

export const { setItems, resetItemsByPage, resetAllItems } =
  listItemSlice.actions;

export default listItemSlice.reducer;
