import { HTMLAttributes } from "react";

import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { IAccount } from "@services/acc/account/type";
import type { IDetail } from "@services/generalType/type";

export interface IProps {
  detailInitialData: IState[];
  isEdit: boolean;
  accountData: IAccount[];
  rpWayData: any;
  fieldKey:
    | "BankStatementId"
    | "TankhahStatementId"
    | "CashStatementId"
    | "TafsiliStatementId";
}

export type IActions =
  | {
      type: "ADD_DATA_SOURCE";
      payload: IState[];
      insertAfterIndex: number;
    }
  | {
      type: "UPDATE_ROW";
      payload: {
        index: number;
        data: Partial<IState>;
      };
    }
  | {
      type: "DELETE_ROW";
      payload: {
        index: number;
        data: Partial<IState>;
      };
    }
  | {
      type: "RESET_DATA";
      payload: IState[];
    }
  | { type: "MOVE"; payload: { activeId: number; overId: number } };

export interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}
export interface RowProps extends HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

export interface IDetailCondition {
  RpWayId: boolean;
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
  VoucherDate: boolean;
  VoucherDesc: boolean;
  Price: boolean;
  FishNumber: boolean;
  BankAccountId?: boolean;
  CashierId?: boolean;
  TankhahdarId?: boolean;
  // BankStatementId?: boolean;
  // CashStatementId?: boolean;
  // TankhahStatementId?: boolean;
  // TafsiliStatementId?: boolean;
}

export interface IState extends IDetail {
  RpWayId: number;
  RpWay?: { RPWayId?: number; VoucherTypeId?: number; AccountId?: number };
  TafsiliId?: number;
  Tafsili?: {
    TafsiliDesc?: string;
  };
  FifthId?: number;
  Fifth?: {
    TafsiliDesc?: string;
  };
  SixthId?: number;
  Sixth?: {
    TafsiliDesc?: string;
  };
  SeventhId?: number;
  Seventh?: {
    TafsiliDesc?: string;
  };
  EightId?: number;
  Eight?: {
    TafsiliDesc?: string;
  };
  NineId?: number;
  Nine?: {
    TafsiliDesc?: string;
  };
  TenId?: number;
  Ten?: {
    TafsiliDesc?: string;
  };
  ElevenId?: number;
  Eleven?: {
    TafsiliDesc?: string;
  };
  TwelveId?: number;
  Twelve?: {
    TafsiliDesc?: string;
  };
  ThirteenId?: number;
  Thirteen?: {
    TafsiliDesc?: string;
  };
  VoucherDate: string;
  VoucherDesc: string;
  Price: number;
  FishNumber: string;
  BankAccountId?: number;
  BankAccount?: {
    AccountName?: string;
  };
  CashierId?: number;
  Cashier?: {
    FullName?: string;
  };
  TankhahdarId?: number;
  TankhahDar?: {
    FullName?: string;
  };
}
