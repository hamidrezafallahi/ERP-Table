import type { IToolbarMenu } from "@type/toolbar";

export interface IState {
  actionConfig: IToolbarMenu | null;
  isRemindMeModalOpen: boolean;
  isChequeDynamicActionOpen: boolean;
  isPanelModalOpen: boolean;
}

export type Action =
  | { type: "OPEN_REMIND_ME_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_REMIND_ME_MODAL" }
  | { type: "OPEN_PANEL_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_PANEL_MODAL" }
  | { type: "OPEN_CHEQUE_DYNAMIC_ACTION_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL" };


