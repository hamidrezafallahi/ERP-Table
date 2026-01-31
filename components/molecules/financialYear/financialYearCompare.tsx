import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useTranslations } from "next-intl";
import { CustomSwitch } from "@components/atoms/defaultElements";
import CustomCheckbox from "@components/atoms/defaultElements/checkbox";
interface IProps {
  compareYearIds: number[];
  setCompareYearIds: Dispatch<SetStateAction<number[]>>;
  isCompareActive: boolean;
  data?: any;
}

const FinancialYearCompare = ({ ...props }: IProps) => {
  const t = useTranslations();
  const { compareYearIds, setCompareYearIds, isCompareActive, data } = props;
  const [showCompare, setShowCompare] = useState(false);
  const [enableCompare, setEnableCompare] = useState(false);

  const handleShowCompare = () => {
    setShowCompare(!showCompare);
    if (showCompare) {
      setCompareYearIds([]);
    }
  };
  const compareCheckboxValues = useMemo(() => {
    return data?.Data?.map((item) => ({
      YearId: item.YearId,
      isChecked: compareYearIds.includes(item.YearId),
      YearDesc: item.YearDesc,
    }));
  }, [data, compareYearIds]);

  const handleCheckbox = (item) => {
    setCompareYearIds((prev) => {
      if (prev.includes(item)) {
        return prev.filter((el) => el !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  useEffect(() => {
    setShowCompare(isCompareActive);
    setEnableCompare(isCompareActive);
  }, [isCompareActive]);

  return (
    <>
      <div className="flex justify-between py-2">
        <div> {t("general.compare")}</div>
        <div>
          <CustomSwitch
            checked={showCompare}
            disabled={!enableCompare}
            onChange={handleShowCompare}
            className={`*:!shadow-none ${
              showCompare
                ? "*:before:!bg-main-black"
                : "*:before:!bg-gray-gray6"
            }   [&>.ant-switch-inner]:!bg-[#F5F5F6] [&>.ant-switch-inner]:!border  [&>.ant-switch-inner]:!border-gray-gray6`}
          />
        </div>
      </div>
      {showCompare && enableCompare && (
        <div className="w-full">
          <div className="gap-3 gap-x-2 grid grid-cols-2">
            {compareCheckboxValues?.map(({ YearId, isChecked, YearDesc }) => (
              <div
                key={YearId}
                className="flex justify-between items-center gap-4 bg-gray-gray15 px-4 rounded w-full !h-8 whitespace-nowrap"
              >
                <CustomCheckbox
                  onChange={() => handleCheckbox(YearId)}
                  checked={isChecked}
                />
                <div className="w-full overflow-hidden text-gray-gray8 text-xs text-ellipsis">
                  {YearDesc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default FinancialYearCompare;
