import {
  createSlice,
  PayloadAction,
  Slice,
} from '@reduxjs/toolkit';
import { ITagInfo } from '@services/base/type';
import type { IFormFieldConfig } from '@type/elementType';

// import { levelUrl } from '@utils/core';
import { PageTypeEnum } from '../../types/enum';
import { PageStateEnum } from './enum';
import type {
  IPage,
  IPageInfo,
  IRow,
  IStateItem,
  IStep,
  IViewData,
} from './type';

const initialState: IPage[] = [];

export const PagesReducer: Slice<IPage[]> = createSlice({
  name: "pages",
  initialState,
  reducers: {
    addNewPage: (state, action: PayloadAction<IPage>) => {
      const { pageId, url, Key, returnPageId, headerType } = action.payload;
      if (!pageId) return state;
      let newState = state.map((p) => ({ ...p, isActive: false }));
      const existIndexPage = newState.findIndex((p) => p.pageId === pageId);

      if (existIndexPage === -1) {
        if (url?.includes("id")) {
          const existUrlIndex = newState.findIndex((p) => p.url === url);
          if (existUrlIndex === -1) {
            const mutableField = JSON.parse(JSON.stringify(action.payload));

            newState.push({
              ...mutableField,
              pageOrder: newState.length + 1,
              isActive: true,
              headerType: headerType ?? "None",
            });
          } else {
            newState = newState.map((p, i) =>
              i === existUrlIndex
                ? { ...p, isActive: true, Key, returnPageId }
                : p,
            );
          }
        } else {
          const mutableField = JSON.parse(JSON.stringify(action.payload));
          newState.push({
            ...mutableField,
            pageOrder: newState.length + 1,
            isActive: true,
            headerType: headerType ?? "None",
          });
        }
      } else {
        newState = newState.map((p, i) =>
          i === existIndexPage
            ? {
                ...p,
                isActive: true,
                Key,
                returnPageId,
                headerType: headerType ?? p.headerType,
              }
            : p,
        );
      }

      return newState;
    },
    setPageOrder: (
      state,
      action: PayloadAction<{
        draggedPageOrder: number;
        dropPageOrder: number;
      }>,
    ) => {
      const { draggedPageOrder, dropPageOrder } = action.payload;
      return state.map((p) => ({
        ...p,
        pageOrder:
          p.pageOrder == draggedPageOrder
            ? dropPageOrder
            : p.pageOrder >= dropPageOrder
              ? p.pageOrder + 1
              : p.pageOrder,
      }));
    },
    removePage: (state, action: PayloadAction<string>) =>
      state.filter((p) => p.pageId !== action.payload),

    setActivePage: (state, action: PayloadAction<string>) =>
      state.map((p) => ({ ...p, isActive: p.pageId === action.payload })),

    setPageType: (state, action: PayloadAction<PageTypeEnum>) =>
      state.map((p) => (p.isActive ? { ...p, type: action.payload } : p)),

    setDeActiveAllPage: (state) =>
      state.map((p) => ({ ...p, isActive: false })),

    setPageState: (state, action: PayloadAction<IPage>) =>
      state.map((p) =>
        p.pageId === action.payload.pageId
          ? {
              ...p,
              pageState: action.payload.pageState,
              Key: action.payload.Key,
            }
          : p,
      ),

    setPageStateByRepo: (state, action: PayloadAction<IPage>) =>
      state.map((p) =>
        p.RepoId === action.payload.RepoId && p.Key === action.payload.Key
          ? {
              ...p,
              pageState: action.payload.pageState,
              Key: action.payload.Key,
            }
          : p,
      ),

    deletePageByRepo: (state, action: PayloadAction<IPage>) =>
      state.filter(
        (p) =>
          !(p.RepoId === action.payload.RepoId && p.Key === action.payload.Key),
      ),

    setListStateByRepo: (state, action: PayloadAction<IPage>) =>
      state.map((p) =>
        p.RepoId === action.payload.RepoId &&
        (p.type === PageTypeEnum.List || p.type === PageTypeEnum.NestedList)
          ? { ...p, pageState: action.payload.pageState }
          : p,
      ),

    setPageCaption: (state, action: PayloadAction<IPage>) =>
      state.map((p) =>
        p.pageId === action.payload.pageId
          ? {
              ...p,
              caption: action.payload.caption,
              captionII: action.payload.captionII,
            }
          : p,
      ),

    setPageData: (state, action: PayloadAction<IFormFieldConfig>) =>
      state.map((p) => {
        if (!p.isActive || p.type === PageTypeEnum.List) return p;
        const { name, value, originalValue, routing = false } = action.payload;
        let pageData = p.pageData ? [...p.pageData] : [];
        const existFieldIndex = pageData.findIndex((f) => f.name === name);

        if (existFieldIndex !== -1) {
          pageData[existFieldIndex] = {
            ...pageData[existFieldIndex],
            value,
            originalValue:
              originalValue ?? pageData[existFieldIndex].originalValue,
          };
        } else {
          const mutableField = JSON.parse(JSON.stringify(action.payload));
          pageData.push(mutableField);
        }

        const changed = pageData.some((f) =>
          f.type === "array"
            ? f.value?.length !== f.originalValue?.length
            : f?.value !== f?.originalValue,
        );

        return {
          ...p,
          pageData,
          pageState: changed && !routing ? PageStateEnum.Changed : p.pageState,
        };
      }),

    setAllPageData: (state, action: PayloadAction<IFormFieldConfig[]>) =>
      state.map((p) =>
        p.isActive && p.type !== PageTypeEnum.List
          ? { ...p, pageData: action.payload }
          : p,
      ),

    setSelectedViewIndex: (state, action: PayloadAction<number>) =>
      state.map((p) =>
        p.isActive ? { ...p, selectedViewIndex: action.payload } : p,
      ),

    setTagsInfo: (state, action: PayloadAction<ITagInfo[]>) =>
      state.map((p) => (p.isActive ? { ...p, TagsInfo: action.payload } : p)),

    resetPageData: (state) =>
      state.map((p) => {
        if (!p.isActive) return p;
        const pageData = p.pageData?.map((f) => ({
          ...f,
          value: f.originalValue,
        }));
        return { ...p, pageData, pageState: p.originalPageState };
      }),

    setSavePageData: (state, action: PayloadAction<number>) =>
      state.map((p) => {
        if (!p.isActive) return p;
        const pageData =
          p.pageData?.map((f) => ({ ...f, originalValue: f.value })) || [];
        const Key = p.Key ?? action.payload;
        const url = !p.Key ? `${p.url}?id=${action.payload}` : p.url;
        return { ...p, pageData, Key, url };
      }),

    setViewData: (state, action: PayloadAction<IViewData>) =>
      state.map((p) => (p.isActive ? { ...p, viewData: action.payload } : p)),

    setPageFilters: (state, action: PayloadAction<Partial<IViewData>>) =>
      state.map((p) =>
        p.isActive
          ? {
              ...p,
              viewData: {
                ...p.viewData,
                ...action.payload,
              },
            }
          : p,
      ),
   

    setStatusItemsList: (
      state,
      action: PayloadAction<{ items: IStateItem; RepoId: number }>,
    ) =>
      state.map((p) =>
        p.RepoId === action.payload.RepoId &&
        (p.type === PageTypeEnum.List || p.type === PageTypeEnum.NestedList)
          ? {
              ...p,
              viewData: {
                ...p.viewData,
                statusItems: [...p.viewData.statusItems, action.payload.items],
              },
            }
          : p,
      ),

    setUndoDeleteItemsList: (
      state,
      action: PayloadAction<{ deletedId: number; RepoId: number }>,
    ) =>
      state.map((p) =>
        p.RepoId === action.payload.RepoId &&
        (p.type === PageTypeEnum.List || p.type === PageTypeEnum.NestedList)
          ? {
              ...p,
              viewData: {
                ...p.viewData,
                deletedItems:
                  p.viewData.deletedItems?.filter(
                    (id) => id !== action.payload.deletedId,
                  ) || [],
              },
            }
          : p,
      ),

    setPageInfo: (
      state,
      action: PayloadAction<{ pageId: string; pageInfo: IPageInfo }>,
    ) =>
      state.map((p) =>
        p.pageId === action.payload.pageId
          ? { ...p, pageInfo: action.payload.pageInfo }
          : p,
      ),

    setShowTags: (state) =>
      state.map((p) =>
        p.isActive
          ? {
              ...p,
              viewData: { ...p.viewData, ShowTags: !p.viewData.ShowTags },
            }
          : p,
      ),

    setRepoViewIdViewData: (
      state,
      action: PayloadAction<{ RepoViewId: number }>,
    ) =>
      state.map((p) =>
        p.isActive
          ? {
              ...p,
              viewData: {
                ...p.viewData,
                RepoViewId: action.payload.RepoViewId,
              },
            }
          : p,
      ),

    setLevelFromToolbar: (
      state,
      action: PayloadAction<{ currentLevel: number; nextLevel: number }>,
    ) => {
      const { currentLevel, nextLevel } = action.payload;
      return state.map((p) => {
        if (!p.isActive) return p;
        const { selectedItems, steps } = p.viewData;
        const foundItem = selectedItems.find(
          (item) => item.Level === currentLevel,
        );
        const FilterIds = steps.map((step) => ({
          Level: step.Level,
          Ids: step.Items.map((i) => i.AccId),
        }));
        if (foundItem)
          FilterIds.push({
            Level: foundItem.Level,
            Ids: foundItem.Items.map((i) => i.AccId),
          });

        return {
          ...p,
          viewData: {
            ...p.viewData,
            // url: levelUrl(nextLevel),
            Level: nextLevel,
            TreeView: false,
            FilterIds,
            steps: [
              ...steps,
              ...(foundItem
                ? [{ Level: foundItem.Level, Items: foundItem.Items }]
                : []),
            ],
          },
        };
      });
    },

    setLevelFromTable: (
      state,
      action: PayloadAction<{ Level: number; item: IRow }>,
    ) => {
      const { Level, item } = action.payload;
      return state.map((p) => {
        if (!p.isActive || Level < 0) return p;

        const currentFilterIds = Array.isArray(p.viewData.FilterIds)
          ? [...p.viewData.FilterIds]
          : [];
        const currentSteps = Array.isArray(p.viewData.steps)
          ? [...p.viewData.steps]
          : [];

        return {
          ...p,
          viewData: {
            ...p.viewData,
            // url: levelUrl(Level + 1),
            Level: Level + 1,
            TreeView: false,
            FilterIds: [...currentFilterIds, { Level, Ids: [item.AccId] }],
            steps: [...currentSteps, { Level, Items: [item] }],
          },
        };
      });
    },

    setLevelFromNavbar: (
      state,
      action: PayloadAction<{ Level: number; index: number }>,
    ) => {
      const { Level, index: order } = action.payload;
      return state.map((p) => {
        if (!p.isActive || Level < 0) return p;

        const steps = p.viewData.steps.filter((_, i) => i < order);
        const FilterIds = steps.map((step) => ({
          Level: step.Level,
          Ids: step.Items.map((i) => i.AccId),
        }));

        return {
          ...p,
          viewData: {
            ...p.viewData,
            // url: levelUrl(Level),
            Level,
            TreeView: false,
            steps,
            FilterIds,
          },
        };
      });
    },

    setSelectedRows: (
      state,
      action: PayloadAction<{ selectedRows: IStep }>,
    ) => {
      const { selectedRows } = action.payload;
      return state.map((p) => {
        if (!p.isActive) return p;
        const selectedItems = Array.isArray(p.viewData.selectedItems)
          ? [...p.viewData.selectedItems]
          : [];

        let updatedItems = selectedItems
          .map((item) =>
            item.Level === selectedRows.Level
              ? selectedRows.Items.length
                ? selectedRows
                : null
              : item,
          )
          .filter(Boolean) as IStep[];

        if (!updatedItems.some((item) => item.Level === selectedRows.Level)) {
          updatedItems.push(selectedRows);
        }

        return {
          ...p,
          viewData: { ...p.viewData, selectedItems: updatedItems },
        };
      });
    },

    resetPages: () => initialState,
  },
});

export const {
  addNewPage,
  removePage,
  setActivePage,
  setPageState,
  setPageStateByRepo,
  deletePageByRepo,
  setListStateByRepo,
  setPageCaption,
  setPageData,
  setAllPageData,
  setPageOrder,
  setTagsInfo,
  resetPageData,
  setSavePageData,
  setViewData,
  setPageInfo,
  setShowTags,
  setRepoViewIdViewData,
  setLevelFromToolbar,
  setLevelFromTable,
  setLevelFromNavbar,
  setSelectedRows,
  setStatusItemsList,
  setUndoDeleteItemsList,
  setDeActiveAllPage,
  resetPages,
  setPageType,
  setSelectedViewIndex,
  setPageFilters,
} = PagesReducer.actions;

export default PagesReducer.reducer;

// ___________________________________
// ____________________________________

// import {
//   createSlice,
//   PayloadAction,
//   Slice,
// } from '@reduxjs/toolkit';
// import { ITagInfo } from '@services/base/type';
// import type { IFormFieldConfig } from '@type/elementType';
// import { levelUrl } from '@utils/core';

// import { PageTypeEnum } from '../../types/enum';
// import { PageStateEnum } from './enum';
// import type {
//   IPage,
//   IPageInfo,
//   IRow,
//   IStateItem,
//   IStep,
//   IViewData,
// } from './type';

// const initialState: IPage[] = [];

// export const PagesReducer: Slice<IPage[]> = createSlice({
//   name: "pages",
//   initialState,
//   reducers: {
//     addNewPage: (state, action: PayloadAction<IPage>) => {
//       const { pageId, url, Key, returnPageId } = action.payload;
//       if (!pageId) return;

//       // deactivate all pages
//       state.forEach((p) => (p.isActive = false));

//       const existPage = state.find((p) => p.pageId === pageId);
//       if (existPage) {
//         existPage.isActive = true;
//         existPage.Key = Key;
//         existPage.returnPageId = returnPageId;
//       } else {
//         if (url?.includes("id")) {
//           const existUrlPage = state.find((p) => p.url === url);
//           if (existUrlPage) {
//             existUrlPage.isActive = true;
//             existUrlPage.Key = Key;
//             existUrlPage.returnPageId = returnPageId;
//           } else {
//             state.push({ ...action.payload, isActive: true });
//           }
//         } else {
//           state.push({ ...action.payload, isActive: true });
//         }
//       }
//     },

//     removePage: (state, action: PayloadAction<string>) => {
//       const index = state.findIndex((p) => p.pageId === action.payload);
//       if (index !== -1) state.splice(index, 1);
//     },

//     setActivePage: (state, action: PayloadAction<string>) => {
//       state.forEach((p) => (p.isActive = p.pageId === action.payload));
//     },

//     setDeActiveAllPage: (state) => {
//       state.forEach((p) => (p.isActive = false));
//     },

//     setPageType: (state, action: PayloadAction<PageTypeEnum>) => {
//       const activePage = state.find((p) => p.isActive);
//       if (activePage) activePage.type = action.payload;
//     },

//     setPageState: (state, action: PayloadAction<IPage>) => {
//       const page = state.find((p) => p.pageId === action.payload.pageId);
//       if (page) {
//         page.pageState = action.payload.pageState;
//         page.Key = action.payload.Key;
//       }
//     },

//     setPageStateByRepo: (state, action: PayloadAction<IPage>) => {
//       state.forEach((p) => {
//         if (
//           p.RepoId === action.payload.RepoId &&
//           p.Key === action.payload.Key
//         ) {
//           p.pageState = action.payload.pageState;
//           p.Key = action.payload.Key;
//         }
//       });
//     },

//     deletePageByRepo: (state, action: PayloadAction<IPage>) => {
//       return state.filter(
//         (p) =>
//           !(p.RepoId === action.payload.RepoId && p.Key === action.payload.Key)
//       );
//     },

//     setListStateByRepo: (state, action: PayloadAction<IPage>) => {
//       state.forEach((p) => {
//         if (
//           p.RepoId === action.payload.RepoId &&
//           (p.type === PageTypeEnum.List || p.type === PageTypeEnum.NestedList)
//         ) {
//           p.pageState = action.payload.pageState;
//         }
//       });
//     },

//     setPageCaption: (state, action: PayloadAction<IPage>) => {
//       const page = state.find((p) => p.pageId === action.payload.pageId);
//       if (page) page.caption = action.payload.caption;
//     },

//     setPageData: (state, action: PayloadAction<IFormFieldConfig>) => {
//       const activePage = state.find(
//         (p) => p.isActive && p.type !== PageTypeEnum.List
//       );
//       if (!activePage) return;

//       if (!activePage.pageData) activePage.pageData = [];
//       const { name, value, originalValue, routing = false } = action.payload;

//       const field = activePage.pageData.find((f) => f.name === name);
//       if (field) {
//         field.value = value;
//         field.originalValue = originalValue ?? field.originalValue;
//       } else {
//         activePage.pageData.push(action.payload);
//       }

//       const changed = activePage.pageData.some((f) =>
//         f.type === "array"
//           ? f.value?.length !== f.originalValue?.length
//           : f.value !== f.originalValue
//       );

//       if (!routing && changed) activePage.pageState = PageStateEnum.Changed;
//     },

//     setAllPageData: (state, action: PayloadAction<IFormFieldConfig[]>) => {
//       const activePage = state.find(
//         (p) => p.isActive && p.type !== PageTypeEnum.List
//       );
//       if (activePage) activePage.pageData = action.payload;
//     },

//     resetPageData: (state) => {
//       const activePage = state.find((p) => p.isActive);
//       if (!activePage || !activePage.pageData) return;

//       activePage.pageData.forEach((f) => (f.value = f.originalValue));
//       activePage.pageState = activePage.originalPageState;
//     },

//     setSavePageData: (state, action: PayloadAction<number>) => {
//       const activePage = state.find((p) => p.isActive);
//       if (!activePage) return;

//       activePage.pageData?.forEach((f) => (f.originalValue = f.value));
//       const Key = activePage.Key ?? action.payload;
//       activePage.Key = Key;
//       activePage.url = !activePage.Key
//         ? `${activePage.url}?id=${action.payload}`
//         : activePage.url;
//     },

//     setTagsInfo: (state, action: PayloadAction<ITagInfo[]>) => {
//       const activePage = state.find((p) => p.isActive);
//       if (activePage) activePage.TagsInfo = action.payload;
//     },

//     setViewData: (state, action: PayloadAction<IViewData>) => {
//       const activePage = state.find((p) => p.isActive);
//       if (activePage) activePage.viewData = action.payload;
//     },

//     setPageInfo: (
//       state,
//       action: PayloadAction<{ pageId: string; pageInfo: IPageInfo }>
//     ) => {
//       const page = state.find((p) => p.pageId === action.payload.pageId);
//       if (page) page.pageInfo = action.payload.pageInfo;
//     },

//     setShowTags: (state) => {
//       const activePage = state.find((p) => p.isActive);
//       if (activePage)
//         activePage.viewData.ShowTags = !activePage.viewData.ShowTags;
//     },

//     setRepoViewIdViewData: (
//       state,
//       action: PayloadAction<{ RepoViewId: number }>
//     ) => {
//       const activePage = state.find((p) => p.isActive);
//       if (activePage)
//         activePage.viewData.RepoViewId = action.payload.RepoViewId;
//     },

//     setLevelFromToolbar: (
//       state,
//       action: PayloadAction<{ currentLevel: number; nextLevel: number }>
//     ) => {
//       const { currentLevel, nextLevel } = action.payload;
//       state.forEach((p) => {
//         if (!p.isActive) return;
//         const { selectedItems, steps } = p.viewData;
//         const foundItem = selectedItems.find((i) => i.Level === currentLevel);
//         const FilterIds = steps.map((s) => ({
//           Level: s.Level,
//           Ids: s.Items.map((i) => i.AccId),
//         }));
//         if (foundItem)
//           FilterIds.push({
//             Level: foundItem.Level,
//             Ids: foundItem.Items.map((i) => i.AccId),
//           });

//         p.viewData = {
//           ...p.viewData,
//           url: levelUrl(nextLevel),
//           Level: nextLevel,
//           TreeView: false,
//           FilterIds,
//           steps: [
//             ...steps,
//             ...(foundItem
//               ? [{ Level: foundItem.Level, Items: foundItem.Items }]
//               : []),
//           ],
//         };
//       });
//     },

//     setLevelFromTable: (
//       state,
//       action: PayloadAction<{ Level: number; item: IRow }>
//     ) => {
//       const { Level, item } = action.payload;
//       state.forEach((p) => {
//         if (!p.isActive || Level < 0) return;
//         const currentFilterIds = Array.isArray(p.viewData.FilterIds)
//           ? [...p.viewData.FilterIds]
//           : [];
//         const currentSteps = Array.isArray(p.viewData.steps)
//           ? [...p.viewData.steps]
//           : [];
//         p.viewData = {
//           ...p.viewData,
//           url: levelUrl(Level + 1),
//           Level: Level + 1,
//           TreeView: false,
//           FilterIds: [...currentFilterIds, { Level, Ids: [item.AccId] }],
//           steps: [...currentSteps, { Level, Items: [item] }],
//         };
//       });
//     },

//     setLevelFromNavbar: (
//       state,
//       action: PayloadAction<{ Level: number; index: number }>
//     ) => {
//       const { Level, index: order } = action.payload;
//       state.forEach((p) => {
//         if (!p.isActive || Level < 0) return;
//         const steps = p.viewData.steps.filter((_, i) => i < order);
//         const FilterIds = steps.map((s) => ({
//           Level: s.Level,
//           Ids: s.Items.map((i) => i.AccId),
//         }));
//         p.viewData = {
//           ...p.viewData,
//           url: levelUrl(Level),
//           Level,
//           TreeView: false,
//           steps,
//           FilterIds,
//         };
//       });
//     },

//     setSelectedRows: (
//       state,
//       action: PayloadAction<{ selectedRows: IStep }>
//     ) => {
//       const { selectedRows } = action.payload;
//       state.forEach((p) => {
//         if (!p.isActive) return;
//         const selectedItems = Array.isArray(p.viewData.selectedItems)
//           ? [...p.viewData.selectedItems]
//           : [];
//         let updatedItems = selectedItems
//           .map((item) =>
//             item.Level === selectedRows.Level
//               ? selectedRows.Items.length
//                 ? selectedRows
//                 : null
//               : item
//           )
//           .filter(Boolean) as IStep[];
//         if (!updatedItems.some((item) => item.Level === selectedRows.Level))
//           updatedItems.push(selectedRows);
//         p.viewData.selectedItems = updatedItems;
//       });
//     },

//     setStatusItemsList: (
//       state,
//       action: PayloadAction<{ items: IStateItem; RepoId: number }>
//     ) => {
//       state.forEach((p) => {
//         if (
//           p.RepoId === action.payload.RepoId &&
//           (p.type === PageTypeEnum.List || p.type === PageTypeEnum.NestedList)
//         ) {
//           p.viewData.statusItems.push(action.payload.items);
//         }
//       });
//     },

//     setUndoDeleteItemsList: (
//       state,
//       action: PayloadAction<{ deletedId: number; RepoId: number }>
//     ) => {
//       state.forEach((p) => {
//         if (
//           p.RepoId === action.payload.RepoId &&
//           (p.type === PageTypeEnum.List || p.type === PageTypeEnum.NestedList)
//         ) {
//           p.viewData.deletedItems =
//             p.viewData.deletedItems?.filter(
//               (id) => id !== action.payload.deletedId
//             ) || [];
//         }
//       });
//     },

//     resetPages: () => initialState,
//   },
// });

// export const {
//   addNewPage,
//   removePage,
//   setActivePage,
//   setPageState,
//   setPageStateByRepo,
//   deletePageByRepo,
//   setListStateByRepo,
//   setPageCaption,
//   setPageData,
//   setAllPageData,
//   setTagsInfo,
//   resetPageData,
//   setSavePageData,
//   setViewData,
//   setPageInfo,
//   setShowTags,
//   setRepoViewIdViewData,
//   setLevelFromToolbar,
//   setLevelFromTable,
//   setLevelFromNavbar,
//   setSelectedRows,
//   setStatusItemsList,
//   setUndoDeleteItemsList,
//   setDeActiveAllPage,
//   resetPages,
//   setPageType,
// } = PagesReducer.actions;

// export default PagesReducer.reducer;
