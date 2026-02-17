import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AccountState } from "./type";

const initialState: AccountState = {
  currentStep: 1,
  passedSteps: [],

  mobile: "",
  code: "",
  name: "",
  fullName: "",
  password: "",

  packageId: 3,
  packageType: "",
  industryType: "",
  industry: "",

  warehouses: [],
  maxWarehouses: 3,

  companies: [],
  maxCompanies: 4,

  currency: [],
  maxCurrencies: 4,

  funds: [],
  maxFunds: 3,

  time: null,
  verifyExpireTime: null,

  isEditing: 0,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      if (!state.passedSteps.includes(action.payload)) {
        state.passedSteps.push(action.payload);
      }
    },

    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      if (!state.passedSteps.includes(action.payload)) {
        state.passedSteps.push(action.payload);
      }
    },

    nextStep: (state) => {
      state.currentStep += 1;
      if (!state.passedSteps.includes(state.currentStep)) {
        state.passedSteps.push(state.currentStep);
      }
    },

    prevStep: (state) => {
      state.currentStep = Math.max(state.currentStep - 1, 1);
    },

    setMobile: (state, action: PayloadAction<string>) => {
      state.mobile = action.payload;
    },

    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },

    setFullName: (state, action: PayloadAction<string>) => {
      state.fullName = action.payload;
    },

    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },

    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },

    setPackageId: (state, action: PayloadAction<number | null>) => {
      state.packageId = action.payload;
    },

    setPackageType: (state, action: PayloadAction<string>) => {
      state.packageType = action.payload;
    },

    setIndustryType: (state, action: PayloadAction<string>) => {
      state.industryType = action.payload;
    },

    setIndustry: (state, action: PayloadAction<string>) => {
      state.industry = action.payload;
    },

    setWarehouses: (state, action: PayloadAction<string[]>) => {
      state.warehouses = action.payload;
    },

    setCompanies: (state, action: PayloadAction<string[]>) => {
      state.companies = action.payload;
    },

    setCurrency: (state, action: PayloadAction<string[]>) => {
      state.currency = action.payload;
    },

    setFunds: (state, action: PayloadAction<string[]>) => {
      state.funds = action.payload;
    },

    setVerifyTime: (state, action: PayloadAction<string | null>) => {
      state.time = action.payload;
    },

    setVerifyExpireTime: (state, action: PayloadAction<number | null>) => {
      state.verifyExpireTime = action.payload;
    },

    setIsEditing: (state, action: PayloadAction<number>) => {
      state.isEditing = action.payload;
    },

    resetAccount: () => initialState,
  },
});

export const {
  setStep,
  goToStep,
  nextStep,
  prevStep,
  setMobile,
  setCode,
  setFullName,
  setName,
  setPassword,
  setPackageId,
  setPackageType,
  setIndustryType,
  setIndustry,
  setWarehouses,
  setCompanies,
  setCurrency,
  setFunds,
  setVerifyTime,
  setVerifyExpireTime,
  setIsEditing,
  resetAccount,
} = accountSlice.actions;

export default accountSlice.reducer;
