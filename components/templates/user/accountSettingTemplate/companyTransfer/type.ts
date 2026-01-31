import { TransferItem } from '../type';

export type Step = "pick" | "phone" | "status";

export type Props = {
  apiUrl?: string;
  data?: TransferItem[];
};

export type CompanyItem = {
  id: number | string;
  name: string;
};

export const fakeCompanies: CompanyItem[] = [
  { id: 1, name: "شرکت آلفا" },
  { id: 2, name: "شرکت بتا" },
  { id: 3, name: "شرکت گاما" },
];

export interface AccountInfo {
  id: string;
  name: string;
  phone: string;
}
