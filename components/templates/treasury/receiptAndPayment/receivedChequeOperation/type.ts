import type { IToolbarMenu } from "@type/toolbar";

export interface IState {
  actionConfig: IToolbarMenu | null;
  isChequeDynamicActionOpen: boolean;
  isInfoModalOpen: boolean;
  isCirculationModalOpen: boolean;
  isPrevStepConfirmationModalOpen: boolean;
}

export type Action =
  | { type: "OPEN_CHEQUE_DYNAMIC_ACTION_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL" }
  | { type: "OPEN_INFO_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_INFO_MODAL" }
  | { type: "OPEN_CIRCULATION_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_CIRCULATION_MODAL" }
  | { type: "OPEN_PREV_STEP_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_PREV_STEP_MODAL" }
  | { type: "CLOSE_ALL_MODAL" };
