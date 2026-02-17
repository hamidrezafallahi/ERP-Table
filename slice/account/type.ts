export interface AccountState {
  currentStep: number;
  passedSteps: number[];

  mobile: string;
  code: string;
  fullName: string;
  name: string;
  password: string;

  packageId: number | null;
  packageType: string;
  industryType: string;
  industry: string;

  warehouses: string[];
  maxWarehouses: number;

  companies: string[];
  maxCompanies: number;

  currency: string[];
  maxCurrencies: number;

  funds: string[];
  maxFunds: number;

  time: string | null;
  verifyExpireTime: number | null;

  isEditing: number;
}
