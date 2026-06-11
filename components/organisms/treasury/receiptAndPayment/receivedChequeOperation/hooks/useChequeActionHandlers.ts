import { ActionLabelsEnum } from "@components/organisms/receiptAndPayment/action/enum";

export const useChequeActionHandlers = ({
  trigger,
  refetch,
  dispatchState,
  selectedId,
  rowFieldKey,
  headerKey,
  setSelectedId,
  setSelectedHeaderId,
  setSelectedItems,
  setSelectedDetails,
}) => {
  const handleAction = (action, record) => {
    setSelectedId(record[rowFieldKey]);
    setSelectedHeaderId([record[headerKey]]);
    setSelectedItems([record[rowFieldKey]]);
    setSelectedDetails([record]);
    switch (action.MenuDesc) {
      case ActionLabelsEnum.ChequeCirculation:
        dispatchState({ type: "OPEN_CIRCULATION_MODAL", payload: action });
        break;
      case ActionLabelsEnum.ChequeStatus:
        dispatchState({ type: "OPEN_INFO_MODAL", payload: action });
        break;
      case ActionLabelsEnum.PrevStep:
        dispatchState({ type: "OPEN_PREV_STEP_MODAL", payload: action });
        break;
      default:
        dispatchState({
          type: "OPEN_CHEQUE_DYNAMIC_ACTION_MODAL",
          payload: action,
        });
    }
  };

  const handlePrevStep = async () => {
    const prevStepResult = await trigger({
      url: "api/trh/update/getBackToPreviousStep",
      body: { DocumentChequeId: selectedId },
    }).unwrap();
    if (prevStepResult.Result === "Success") {
      dispatchState({ type: "CLOSE_PREV_STEP_MODAL" });
      refetch();
    }
  };

  return {
    handleAction,
    handlePrevStep,
  };
};
