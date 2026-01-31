import { Dispatch, ReactNode } from "react";

export interface IAdditionalAction<T> {
  icon?: string;
  label: string | ReactNode;
  disabled?: boolean | (() => boolean);
  shortcutKey?: string;
  handler: (params: {
    record: T;
    index: number;
    field: string;
    helpers: {
      detailData: T[];
      dispatchDetailData: Dispatch<IActions<T>>;
    };
  }) => void;
}

export type IActions<T> =
  | {
      type: "ADD_DATA_SOURCE";
      payload: T[];
      insertAfterIndex: number;
    }
  | {
      type: "UPDATE_ROW";
      payload: { index: number; data: Partial<T> };
    }
  | {
      type: "DELETE_ROW";
      payload: { index: number; data: Partial<T> };
    }
  | {
      type: "UNDO_DELETE_ROW";
      payload: { index: number; data: Partial<T> };
    }
  | { type: "RESET_DATA"; payload: T[] }
  | { type: "MOVE"; payload: { activeId: number; overId: number } };
