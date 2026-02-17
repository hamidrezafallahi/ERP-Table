import {
  createSlice,
  PayloadAction,
  Slice,
} from '@reduxjs/toolkit';

import type {
  IDuration,
  IInitialContainer,
  ITags,
} from './type';

const initialState: IInitialContainer = {
  defaultTags: [],
  recordsTags: [],
  minimize: false,
  duration: {
    from: Date.now(),
    to: Date.now(),
  },
  verifyExpireTime: null,
};

export const ContainerReducer: Slice<IInitialContainer> = createSlice({
  name: "container",
  initialState,
  reducers: {
    addSpecificTags: (
      state: IInitialContainer,
      action: PayloadAction<ITags>
    ) => {
      const { RepoId, RefId, tags, revalidated } = action.payload;
      const existIndex = state.recordsTags.findIndex(
        (tag) => tag.RepoId === RepoId && tag.RefId === RefId
      );

      if (existIndex !== -1) {
        const updatedTag = {
          ...state.recordsTags[existIndex],
          revalidated,
          ...(revalidated ? { tags } : {}),
        };
        return {
          ...state,
          recordsTags: state.recordsTags.map((tag, i) =>
            i === existIndex ? updatedTag : tag
          ),
        };
      } else {
        return {
          ...state,
          recordsTags: [...state.recordsTags, action.payload],
        };
      }
    },

    addDefaultTags: (
      state: IInitialContainer,
      action: PayloadAction<IInitialContainer>
    ) => {
      return {
        ...state,
        defaultTags: action.payload.defaultTags,
      };
    },

    setMinimize: (state: IInitialContainer, action: PayloadAction<boolean>) => {
      return {
        ...state,
        minimize: action.payload,
      };
    },
    setDuration: (
      state: IInitialContainer,
      action: PayloadAction<IDuration>
    ) => {
      return {
        ...state,
        duration: action.payload,
      };
    },
    setVerifyExpireTime: (
      state: IInitialContainer,
      action: PayloadAction<number | null>
    ) => {
      return {
        ...state,
        verifyExpireTime: action.payload,
      };
    },

    resetContainer: () => initialState,
  },
});

export const {
  addSpecificTags,
  addDefaultTags,
  resetContainer,
  setMinimize,
  setDuration,
  setVerifyExpireTime,
} = ContainerReducer.actions;

export default ContainerReducer.reducer;
