import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";

type sourceArrayType = {
  label: string;
  value: number;
};

interface AccountLevelProps {
  placeConfigId?: number;
  sourceArray: sourceArrayType[];
}

export const useGetAccountLevel = (props: AccountLevelProps) => {
  const { placeConfigId = 5006, sourceArray } = props;
  const { placeConfigValue } = useAppSelector(
    (state) => ({
      placeConfigValue: state.withPersist.config.placeConfigs?.find(
        (item) => item.PlaceConfigId === placeConfigId,
      ).Value,
    }),
    shallowEqual,
  );
  const maxLevel = Number(placeConfigValue) - 1;
  const selectOption = sourceArray.slice(0, maxLevel);

  return { selectOption };
};
