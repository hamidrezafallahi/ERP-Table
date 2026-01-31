import type { IToolbarMenu } from "@type/toolbar";

export interface IState {
  actionConfig: IToolbarMenu | null;
  // isChequeToPersonModalOpen: boolean;
  // isChequeToBankModalOpen: boolean;
  isChequeDynamicActionOpen: boolean;
}

export type Action =
  // | { type: "OPEN_CHEQUE_TO_BANK_MODAL"; payload: IToolbarMenu }
  // | { type: "CLOSE_CHEQUE_TO_BANK_MODAL" }
  // | { type: "OPEN_CHEQUE_TO_PERSON_MODAL"; payload: IToolbarMenu }
  // | { type: "CLOSE_CHEQUE_TO_PERSON_MODAL" }
  | { type: "OPEN_CHEQUE_DYNAMIC_ACTION_MODAL"; payload: IToolbarMenu }
  | { type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL" };
