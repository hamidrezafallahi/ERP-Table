import { Action, IState } from "../../../../../templates/treasury/receiptAndPayment/receivedChequeOperation/type";

export const initialState: IState = {
  actionConfig: null,
  isChequeDynamicActionOpen: false,
  isInfoModalOpen: false,
  isCirculationModalOpen: false,
  isPrevStepConfirmationModalOpen: false,
};

export function issuedCheckReducer(state: IState, action: Action): IState {
  switch (action.type) {
    case "OPEN_CHEQUE_DYNAMIC_ACTION_MODAL":
      return {
        ...state,
        isChequeDynamicActionOpen: true,
        actionConfig: action.payload,
      };

    case "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL":
      return {
        ...state,
        isChequeDynamicActionOpen: false,
        actionConfig: null,
      };

    case "OPEN_INFO_MODAL":
      return {
        ...state,
        isInfoModalOpen: true,
        actionConfig: action.payload,
      };

    case "CLOSE_INFO_MODAL":
      return {
        ...state,
        isInfoModalOpen: false,
        actionConfig: null,
      };

    case "OPEN_CIRCULATION_MODAL":
      return {
        ...state,
        isCirculationModalOpen: true,
        actionConfig: action.payload,
      };

    case "CLOSE_CIRCULATION_MODAL":
      return {
        ...state,
        isCirculationModalOpen: false,
        actionConfig: null,
      };

    case "OPEN_PREV_STEP_MODAL":
      return {
        ...state,
        isPrevStepConfirmationModalOpen: true,
        actionConfig: action.payload,
      };

    case "CLOSE_PREV_STEP_MODAL":
      return {
        ...state,
        isPrevStepConfirmationModalOpen: false,
        actionConfig: null,
      };

    case "CLOSE_ALL_MODAL":
      return initialState;

    default:
      return state;
  }
}
