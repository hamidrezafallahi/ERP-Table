import { useMemo } from "react";
import { stateConfig } from "@components/organisms/receiptAndPayment/config";

export const useChequeGroupActions = (
  selectedItems,
  records,
  rowFieldKey
) => {
  return useMemo(() => {
    const selectedGroupCondition = selectedItems?.map((item) => {
      const correctField = records?.find((el) => el[rowFieldKey] === item);
      return stateConfig.find(
        (i) => i.value === correctField?.DocumentCheque?.StateId
      )?.title;
    });
    return {
      render:
        selectedGroupCondition?.length > 0 &&
        selectedGroupCondition?.every(
          (item) => item === selectedGroupCondition[0]
        ),
      condition:
        selectedGroupCondition?.length > 0
          ? selectedGroupCondition[0]
          : null,
    };
  }, [selectedItems, records, rowFieldKey]);
};
