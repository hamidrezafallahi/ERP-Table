import { TransferItem } from '../type';

export interface AccountInfo {
  name: string;
  phone: string;
}
export type Step = "search" | "confirm" | "status";

export type Props = {
  apiUrl?: string;
  data?: TransferItem[];
};
