import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";

import type {
  ICustomer,
  IEffectiveTypeInFactor,
  IFactorItem,
  IFactorState,
  IGoodsCategory,
} from "./type";

const initialState: IFactorState = {};

export const FactorsReducer: Slice<IFactorState> = createSlice({
  name: "factors",
  initialState,
  reducers: {
    setGoodsCategories: (
      state,
      action: PayloadAction<{ pageId: string; goods: IGoodsCategory[] }>
    ) => {
      const { pageId, goods } = action.payload;
      const activeFactor = state[pageId];
      if (activeFactor) {
        state[pageId] = {
          ...activeFactor,
          invoice: {
            ...activeFactor.invoice,
            goods,
          },
        };
      }
    },

    setInvoiceCategory: (
      state,
      action: PayloadAction<{ pageId: string; goodCategories: IGoodsCategory }>
    ) => {
      const { pageId, goodCategories } = action.payload;
      const activeFactor = state[pageId];
      if (activeFactor) {
        state[pageId] = {
          ...activeFactor,
          invoice: {
            ...activeFactor.invoice,
            invoiceCategories: activeFactor.invoice?.invoiceCategories
              ? [...activeFactor.invoice.invoiceCategories, goodCategories]
              : [goodCategories],
          },
        };
      }
    },

    setProducts: (
      state,
      action: PayloadAction<{ pageId: string; products: IFactorItem[] }>
    ) => {
      const { pageId, products } = action.payload;
      const activeFactor = state[pageId];
      if (activeFactor) {
        state[pageId] = {
          ...activeFactor,
          invoice: {
            ...activeFactor.invoice,
            products,
          },
        };
      }
    },

    setInvoiceCategories: (
      state,
      action: PayloadAction<{
        pageId: string;
        goodCategories: IGoodsCategory[];
      }>
    ) => {
      const { pageId, goodCategories } = action.payload;
      const activeFactor = state[pageId];
      if (activeFactor) {
        state[pageId] = {
          ...activeFactor,
          invoice: {
            ...activeFactor.invoice,
            invoiceCategories: goodCategories,
            products: [],
          },
        };
      }
    },

    setItemToFactor: (
      state,
      action: PayloadAction<{
        pageId: string;
        item: IFactorItem;
        type?: "Increment" | "Decrement";
      }>
    ) => {
      const { pageId, item, type } = action.payload;
      const activeFactor = state[pageId];
      if (!activeFactor) return;

      let items = activeFactor.invoice.factor?.items || [];

      const existIndex = items.findIndex((p) => p.GoodsId === item.GoodsId);

      if (existIndex === -1) {
        items = [...items, item];
      } else {
        const updatedItem = { ...items[existIndex] };
        if (type === "Increment") {
          updatedItem.GoodsCount += 1;
        } else if (type === "Decrement") {
          if (updatedItem.GoodsCount > 1) {
            updatedItem.GoodsCount -= 1;
          } else {
            items.splice(existIndex, 1);
          }
        }
        items = [
          ...items.slice(0, existIndex),
          updatedItem,
          ...items.slice(existIndex + 1),
        ].filter(Boolean);
      }

      const sum = items.reduce(
        (acc, i) => acc + i.GoodsPrice * i.GoodsCount,
        0
      );
      const discountSum = items.reduce(
        (acc, i) => acc + i.GoodsDiscount * i.GoodsCount,
        0
      );
      const tax = items.reduce((acc, i) => acc + i.GoodsCount, 0);
      const totalPrice = sum + tax - discountSum;

      state[pageId] = {
        ...activeFactor,
        invoice: {
          ...activeFactor.invoice,
          factor: {
            ...activeFactor.invoice.factor,
            items,
            sum,
            discountSum,
            tax,
            totalPrice,
          },
        },
      };
    },

    removeItemFromFactor: (
      state,
      action: PayloadAction<{ pageId: string; item: IFactorItem }>
    ) => {
      const { pageId, item } = action.payload;
      const activeFactor = state[pageId];
      if (!activeFactor?.invoice.factor?.items) return;

      const items = activeFactor.invoice.factor.items.filter(
        (p) => p.GoodsId !== item.GoodsId
      );

      const sum = items.reduce(
        (acc, i) => acc + i.GoodsPrice * i.GoodsCount,
        0
      );
      const discountSum = items.reduce(
        (acc, i) => acc + i.GoodsDiscount * i.GoodsCount,
        0
      );
      const tax = sum * 0.2;
      const totalPrice = sum + tax - discountSum;

      state[pageId] = {
        ...activeFactor,
        invoice: {
          ...activeFactor.invoice,
          factor: {
            ...activeFactor.invoice.factor,
            items,
            sum,
            discountSum,
            tax,
            totalPrice,
          },
        },
      };
    },

    setCustomerForFactor: (
      state,
      action: PayloadAction<{ pageId: string; customer: ICustomer }>
    ) => {
      const { pageId, customer } = action.payload;
      const activeFactor = state[pageId];
      if (activeFactor) {
        state[pageId] = {
          ...activeFactor,
          invoice: {
            ...activeFactor.invoice,
            factor: {
              ...activeFactor.invoice.factor,
              customer,
            },
          },
        };
      } else {
        state[pageId] = { customer };
      }
    },

    setSaleTypeFactor: (
      state,
      action: PayloadAction<{ pageId: string; saleTypeId: number }>
    ) => {
      const { pageId, saleTypeId } = action.payload;
      const activeFactor = state[pageId];
      if (activeFactor) {
        state[pageId] = {
          ...activeFactor,
          invoice: {
            ...activeFactor.invoice,
            factor: {
              ...activeFactor.invoice.factor,
              saleTypeId,
            },
          },
        };
      }
    },

    setElementsInFactor: (
      state,
      action: PayloadAction<{
        pageId: string;
        type: "addElements" | "discountItems" | "taxItems";
        elements: IEffectiveTypeInFactor[];
      }>
    ) => {
      const { pageId, type, elements } = action.payload;
      const activeFactor = state[pageId];
      if (activeFactor) {
        state[pageId] = {
          ...activeFactor,
          invoice: {
            ...activeFactor.invoice,
            factor: {
              ...activeFactor.invoice.factor,
              [type]: elements,
            },
          },
        };
      }
    },

    resetFactors: () => initialState,
  },
});

export const {
  setGoodsCategories,
  setInvoiceCategory,
  setProducts,
  setInvoiceCategories,
  setItemToFactor,
  removeItemFromFactor,
  setCustomerForFactor,
  setSaleTypeFactor,
  setElementsInFactor,
  resetFactors,
} = FactorsReducer.actions;

export default FactorsReducer.reducer;
