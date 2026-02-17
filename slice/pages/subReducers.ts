// import {
//   createSlice,
//   PayloadAction,
// } from '@reduxjs/toolkit';
// import { ITagInfo } from '@services/base/type';
// import { ICustomer } from '@services/sale/customer/type';
// import { IFormFieldConfig } from '@type/elementType';
// import { PageTypeEnum } from '@type/enum';

// import { PageStateEnum } from './enum';
// import {
//   IFactorItem,
//   IGoodsCategory,
//   IPageInfo,
//   IViewData,
// } from './type';

// interface IPage {
//   pageId: string;
//   isActive: boolean;
//   pageData: IFormFieldConfig[];
//   invoice: {
//     goods: IGoodsCategory[];
//     products: IFactorItem[];
//     factor: {
//       items: IFactorItem[];
//       sum: number;
//       discountSum: number;
//       tax: number;
//       totalPrice: number;
//       customer?: ICustomer;
//       saletypeId?: number;
//     };
//     invoiceCategories?: IGoodsCategory[];
//   };
//   viewData: IViewData;
//   TagsInfo?: ITagInfo[];
//   pageState?: PageStateEnum;
//   type?: PageTypeEnum;
//   caption?: string;
//   Key?: number;
//   url?: string;
//   returnPageId?: string;
//   RepoId?: number;
//   pageInfo?: IPageInfo;
//   originalPageState?: PageStateEnum;
// }

// interface PagesState {
//   pages: IPage[];
// }

// const initialState: PagesState = { pages: [] };




// const pageReducers = {
//   addNewPage: (state: PagesState, action: PayloadAction<IPage>) => {
//     const { pageId, url, Key, returnPageId } = action.payload;
//     if (!pageId) return;

//     state.pages.forEach(p => (p.isActive = false));
//     const existIndex = state.pages.findIndex(p => p.pageId === pageId);

//     if (existIndex === -1) {
//       const existUrl = url.includes("id") ? state.pages.findIndex(p => p.url === url) : -1;
//       if (existUrl === -1) {
//         state.pages.push({ ...action.payload, isActive: true });
//       } else {
//         state.pages[existUrl].isActive = true;
//         state.pages[existUrl].Key = Key;
//         state.pages[existUrl].returnPageId = returnPageId;
//       }
//     } else {
//       state.pages[existIndex].isActive = true;
//       state.pages[existIndex].Key = Key;
//       state.pages[existIndex].returnPageId = returnPageId;
//     }
//   },

//   removePage: (state: PagesState, action: PayloadAction<string>) => {
//     state.pages = state.pages.filter(p => p.pageId !== action.payload);
//   },

//   setActivePage: (state: PagesState, action: PayloadAction<string>) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (activePage?.pageId !== action.payload) {
//       state.pages.forEach(p => (p.isActive = false));
//       const existIndex = state.pages.findIndex(p => p.pageId === action.payload);
//       if (existIndex !== -1) state.pages[existIndex].isActive = true;
//     }
//   },

//   setPageType: (state: PagesState, action: PayloadAction<PageTypeEnum>) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (activePage) activePage.type = action.payload;
//   },

//   setPageState: (state: PagesState, action: PayloadAction<IPage>) => {
//     const index = state.pages.findIndex(p => p.pageId === action.payload.pageId);
//     if (index !== -1) {
//       state.pages[index].pageState = action.payload.pageState;
//       state.pages[index].Key = action.payload.Key;
//     }
//   },
// };
// const pageDataReducers = {
//   setPageData: (state: PagesState, action: PayloadAction<IFormFieldConfig>) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (!activePage) return;

//     const existField = activePage.pageData.find(f => f.name === action.payload.name);
//     if (existField) {
//       existField.value = action.payload.value;
//       existField.originalValue = action.payload.originalValue ?? existField.originalValue;
//     } else {
//       activePage.pageData.push(action.payload);
//     }

//     const changed = activePage.pageData.some(f =>
//       f.type === "array" ? f.originalValue?.length !== f.value?.length : f.originalValue !== f.value
//     );
//     if (changed) activePage.pageState = PageStateEnum.Changed;
//   },

//   setAllPageData: (state: PagesState, action: PayloadAction<IFormFieldConfig[]>) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (activePage) activePage.pageData = action.payload;
//   },

//   resetPageData: (state: PagesState) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (activePage) {
//       activePage.pageData.forEach(f => (f.value = f.originalValue));
//       activePage.pageState = activePage.originalPageState;
//     }
//   },
// };
// const invoiceReducers = {
//   setGoodsCategories: (state: PagesState, action: PayloadAction<IGoodsCategory[]>) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (activePage) activePage.invoice.goods = action.payload;
//   },

//   setProducts: (state: PagesState, action: PayloadAction<IFactorItem[]>) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (activePage) activePage.invoice.products = action.payload;
//   },

//   setItemToFactor: (
//     state: PagesState,
//     action: PayloadAction<{ item: IFactorItem; type?: "Increment" | "Decrement" }>
//   ) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (!activePage) return;

//     const { item, type } = action.payload;
//     const factorItems = activePage.invoice.factor.items;
//     const index = factorItems.findIndex(i => i.GoodsId === item.GoodsId);

//     if (index === -1) factorItems.push(item);
//     else {
//       if (type === "Increment") factorItems[index].GoodsCount += 1;
//       else if (type === "Decrement") {
//         if (factorItems[index].GoodsCount > 1) factorItems[index].GoodsCount -= 1;
//         else factorItems.splice(index, 1);
//       }
//     }

//     const sum = factorItems.reduce((acc, i) => acc + i.GoodsPrice * i.GoodsCount, 0);
//     const discountSum = factorItems.reduce((acc, i) => acc + i.GoodsDiscount * i.GoodsCount, 0);
//     const tax = factorItems.reduce((acc, i) => acc + i.tax * i.GoodsCount, 0);
//     activePage.invoice.factor.sum = sum;
//     activePage.invoice.factor.discountSum = discountSum;
//     activePage.invoice.factor.tax = tax;
//     activePage.invoice.factor.totalPrice = sum + tax - discountSum;
//   },

//   removeItemFromFactor: (state: PagesState, action: PayloadAction<IFactorItem>) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (!activePage?.invoice.factor.items) return;
//     activePage.invoice.factor.items = activePage.invoice.factor.items.filter(
//       i => i.GoodsId !== action.payload.GoodsId
//     );
//     const sum = activePage.invoice.factor.items.reduce(
//       (acc, i) => acc + i.GoodsPrice * i.GoodsCount,
//       0
//     );
//     const discountSum = activePage.invoice.factor.items.reduce(
//       (acc, i) => acc + i.GoodsDiscount * i.GoodsCount,
//       0
//     );
//     const tax = activePage.invoice.factor.items.reduce((acc, i) => acc + i.tax * i.GoodsCount, 0);
//     activePage.invoice.factor.sum = sum;
//     activePage.invoice.factor.discountSum = discountSum;
//     activePage.invoice.factor.tax = tax;
//     activePage.invoice.factor.totalPrice = sum + tax - discountSum;
//   },

//   setCustomerForFactor: (state: PagesState, action: PayloadAction<ICustomer>) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (activePage) activePage.invoice.factor.customer = action.payload;
//   },

//   setSaleTypeFactor: (state: PagesState, action: PayloadAction<number>) => {
//     const activePage = state.pages.find(p => p.isActive);
//     if (activePage) activePage.invoice.factor.saletypeId = action.payload;
//   },
// };
// export const PagesReducer = createSlice({
//   name: "pages",
//   initialState,
//   reducers: {
//     ...pageReducers,
//     ...pageDataReducers,
//     ...invoiceReducers,
//   },
// });

// export const {
//   addNewPage,
//   removePage,
//   setActivePage,
//   setPageType,
//   setPageState,
//   setPageData,
//   setAllPageData,
//   resetPageData,
//   setGoodsCategories,
//   setProducts,
//   setItemToFactor,
//   removeItemFromFactor,
//   setCustomerForFactor,
//   setSaleTypeFactor,
// } = PagesReducer.actions;

// export default PagesReducer.reducer;
