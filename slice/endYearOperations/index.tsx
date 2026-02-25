import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  type EndYearOperationError,
  type EndYearOperationErrorItem,
  type EndYearOperationMode,
  type EndYearOperationState,
  EndYearStepStatusEnum,
  StepProcessTypeEnum,
} from "./type";

/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */

const stepValuesForMode = (
  mode: EndYearOperationMode,
): StepProcessTypeEnum[] =>
  mode === "withOpening"
    ? [
        StepProcessTypeEnum.Review,
        StepProcessTypeEnum.Validation,
        StepProcessTypeEnum.CloseExpenseAccounts,
        StepProcessTypeEnum.CloseIncomeAccounts,
        StepProcessTypeEnum.CloseProfitAccounts,
        StepProcessTypeEnum.ClosingDocument,
        StepProcessTypeEnum.OpeningDocument,
      ]
    : [
        StepProcessTypeEnum.Review,
        StepProcessTypeEnum.Validation,
        StepProcessTypeEnum.CloseExpenseAccounts,
        StepProcessTypeEnum.CloseIncomeAccounts,
        StepProcessTypeEnum.CloseProfitAccounts,
        StepProcessTypeEnum.ClosingDocument,
      ];

const ensureModeShape = (state: EndYearOperationState) => {
  const values = stepValuesForMode(state.mode);
  const valuesSet = new Set(values);

  // remove invalid keys
  Object.keys(state.statusByValue).forEach((k) => {
    const value = Number(k) as StepProcessTypeEnum;
    if (!valuesSet.has(value)) {
      delete state.statusByValue[value];
    }
  });

  // initialize missing keys
  values.forEach((value) => {
    if (!state.statusByValue[value]) {
      state.statusByValue[value] = 1; // Pending
    }
  });

  // fix active step if invalid
  if (state.activeStepValue !== null && !valuesSet.has(state.activeStepValue)) {
    state.activeStepValue = values[0] ?? null;
  }
};

/* -------------------------------------------------- */
/* Initial State */
/* -------------------------------------------------- */

const initialState: EndYearOperationState = {
  mode: "withoutOpening",
  isRunning: false,
  activeStepValue: null,
  statusByValue: {} as Record<StepProcessTypeEnum, EndYearStepStatusEnum>,
  errors: [],
  checkErrorsList: [],
  validationErrorsList: [],
};

/* -------------------------------------------------- */
/* Slice */
/* -------------------------------------------------- */

const endYearOperations = createSlice({
  name: "endYearOperations",
  initialState,
  reducers: {
    setEndYearMode: (state, action: PayloadAction<EndYearOperationMode>) => {
      state.mode = action.payload;
      ensureModeShape(state);
    },

    startEndYearOperation: (
      state,
      action: PayloadAction<{ mode: EndYearOperationMode }>,
    ) => {
      state.mode = action.payload.mode;
      state.isRunning = true;
      state.activeStepValue = stepValuesForMode(state.mode)[0] ?? null;
      state.statusByValue = {} as Record<
        StepProcessTypeEnum,
        EndYearStepStatusEnum
      >;

      ensureModeShape(state);
    },

    finishEndYearOperation: (state) => {
      state.isRunning = false;
    },

    setActiveEndYearStep: (
      state,
      action: PayloadAction<StepProcessTypeEnum>,
    ) => {
      const values = stepValuesForMode(state.mode);
      if (!values.includes(action.payload)) return;

      state.activeStepValue = action.payload;
    },

    setEndYearStepStatus: (
      state,
      action: PayloadAction<{
        value: StepProcessTypeEnum;
        status: EndYearStepStatusEnum;
      }>,
    ) => {
      const values = stepValuesForMode(state.mode);
      if (!values.includes(action.payload.value)) return;

      state.statusByValue[action.payload.value] = action.payload.status;
    },

    resetEndYearOperation: (state) => {
      const mode = state.mode;
      return { ...initialState, mode };
    },

    setEndYearOperationErrors: (
      state,
      action: PayloadAction<EndYearOperationError[]>,
    ) => {
      state.errors = action.payload;
    },

    setEndYearCheckOperationErrors: (
      state,
      action: PayloadAction<EndYearOperationErrorItem[]>,
    ) => {
      state.checkErrorsList = action.payload;
    },

    setEndYearValidationOperationErrors: (
      state,
      action: PayloadAction<EndYearOperationErrorItem[]>,
    ) => {
      state.validationErrorsList = action.payload;
    },
  },
});

/* -------------------------------------------------- */
/* Exports */
/* -------------------------------------------------- */

export const {
  setEndYearMode,
  startEndYearOperation,
  finishEndYearOperation,
  setActiveEndYearStep,
  setEndYearStepStatus,
  resetEndYearOperation,
  setEndYearOperationErrors,
  setEndYearCheckOperationErrors,
  setEndYearValidationOperationErrors,
} = endYearOperations.actions;

export const selectEndYearOperations = (state: any): EndYearOperationState =>
  (state?.withoutPersist?.endYearOperations as EndYearOperationState) ??
  initialState;

export default endYearOperations.reducer;
