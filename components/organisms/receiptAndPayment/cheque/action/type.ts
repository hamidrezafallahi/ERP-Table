import type { IToolbarMenu } from "@type/toolbar";

export interface IState {
  actionConfig: IToolbarMenu | null;
  isChequeDynamicActionOpen: boolean;
  isInfoActionOpen: boolean;
}

export type Action =
  | { type: "OPEN_CHEQUE_DYNAMIC_ACTION_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL" }
  | { type: "OPEN_INFO_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_INFO_MODAL" };
