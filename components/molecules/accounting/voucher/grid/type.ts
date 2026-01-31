import { Dispatch, HTMLAttributes, SetStateAction } from "react";

import type { IVoucherTotal } from "@components/organisms/accounting/voucher/type";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { IAccount } from "@services/acc/account/type";
import type { IVoucherDetails } from "@services/acc/voucherDetails/type";

export interface IProps {
  detailInitialData: IVoucherDetails[];
  isEdit: boolean;
  accountData: IAccount[];
  setVoucherTotal?: Dispatch<SetStateAction<IVoucherTotal>>;
  isLoading?: boolean;
  currentPage?: number;
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

export interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}
export interface RowProps extends HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

export interface IVoucherDetailCondition {
  AccountId: boolean;
  TafsiliId: boolean;
  FifthId: boolean;
  SixthId: boolean;
  SeventhId: boolean;
  EightId: boolean;
  NineId: boolean;
  TenId: boolean;
  ElevenId: boolean;
  TwelveId: boolean;
  ThirteenId: boolean;
  DetailDesc: boolean;
  Bes: boolean;
  Bed: boolean;
}
