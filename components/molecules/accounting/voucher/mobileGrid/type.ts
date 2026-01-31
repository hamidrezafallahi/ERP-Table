import { Dispatch, SetStateAction } from "react";

import type { IVoucherTotal } from "@components/organisms/accounting/voucher/type";
import type { IAccount } from "@services/acc/account/type";
import type { IVoucherDetails } from "@services/acc/voucherDetails/type";

export interface IProps {
  detailInitialData: IVoucherDetails[];
  isEdit: boolean;
  accountData: IAccount[];
  setVoucherTotal?: Dispatch<SetStateAction<IVoucherTotal>>;
  setShowForm?: Dispatch<SetStateAction<boolean>>;
  isLoading?: boolean;
  currentPage?: number;
  totalCount?: number;
  setPage?: Dispatch<SetStateAction<number>>;
}
export interface IChildHandle {
  mobileHandleAdd: (index: number) => void;
}
export type IActions =
  | {
      type: "ADD_DATA_SOURCE";
      payload: IVoucherDetails[];
      insertAfterIndex: number;
    }
  | {
      type: "UPDATE_ROW";
      payload: { index: number; data: Partial<IVoucherDetails> };
    }
  | {
      type: "DELETE_ROW";
      payload: { index: number; data: Partial<IVoucherDetails> };
    }
  | {
      type: "UNDO_DELETE_ROW";
      payload: { index: number; data: Partial<IVoucherDetails> };
    }
  | { type: "RESET_DATA"; payload: IVoucherDetails[] }
  | { type: "MOVE"; payload: { activeId: number; overId: number } };
