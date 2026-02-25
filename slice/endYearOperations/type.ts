export enum EndYearStepStatusEnum {
  Pending = 1,
  Success,
  Failed,
}
export enum StepProcessTypeEnum {
  Review = 1,
  Validation = 2,
  CloseExpenseAccounts = 3,
  CloseIncomeAccounts = 4,
  CloseProfitAccounts = 5,
  ClosingDocument = 6,
  OpeningDocument = 7,
}

export type EndYearOperationMode = "withOpening" | "withoutOpening";

export interface EndYearOperationError {
  errorDesc?: string;
}

export interface EndYearOperationErrorItem {
  voucherHeaderId?: number;
  rowNum?: number;
  voucherNumber?: string;
  detailDesc?: string;
  errorMessage?: string;
  voucherDate?: string;
}

export interface EndYearOperationState {
  mode: EndYearOperationMode;
  isRunning: boolean;

  // active step is a STEP type
  activeStepValue: StepProcessTypeEnum | null;

  // key = STEP
  // value = STATUS
  statusByValue: Partial<Record<StepProcessTypeEnum, EndYearStepStatusEnum>>;

  errors: EndYearOperationError[];
  checkErrorsList: EndYearOperationErrorItem[];
  validationErrorsList: EndYearOperationErrorItem[];
}

export interface EndYearStepDef {
  label: string;
  value: StepProcessTypeEnum;
}

export interface EndYearStepUI extends EndYearStepDef {
  status: EndYearStepStatusEnum;
  activeStep: StepProcessTypeEnum;
}
