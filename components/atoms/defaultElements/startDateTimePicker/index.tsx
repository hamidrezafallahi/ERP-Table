import React, { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";
import { IFormFieldConfig } from "@type/elementType";

import CustomCheckbox from "../checkbox";
import { NewDatePicker } from "../newDatePicker";
import { NewTimePicker } from "../newTimePicker";

interface StartDateTimePickerProps {
  label?: string;
  config?: IFormFieldConfig;
  isNow?: boolean;
  setIsNow?: (value: boolean) => void;
}

const StartDateTimePicker: React.FC<StartDateTimePickerProps> = ({
  config,
  isNow: isNowProp,
  setIsNow: setIsNowProp,
  label,
}) => {
  const t = useTranslations();
  const dispatch = useDispatch();

  const { reduxIsNow, Value } = useAppSelector((state) => {
    const activePage = state?.withPersist?.pages?.find((p) => p?.isActive);
    const reduxIsNow = activePage?.pageData?.find(
      (pd) => pd?.name === "IsSetNow"
    )?.originalValue;
    const Value = activePage?.pageData?.find(
      (pd) => pd?.name === config?.name
    )?.value;
    return { reduxIsNow, Value };
  }, shallowEqual);

  const [internalIsNow, setInternalIsNow] = useState<boolean>(true);

  useEffect(() => {
    if (typeof reduxIsNow === "boolean") setInternalIsNow(reduxIsNow);
  }, [reduxIsNow]);

  const isNow = isNowProp ?? internalIsNow;
  const setIsNow = setIsNowProp ?? setInternalIsNow;

  const handleChangeCheckbox = (e: any) => {
    const value =
      typeof e === "boolean" ? e : e?.target?.checked ?? e?.checked ?? false;
    setIsNow(value);
    dispatch(
      setPageData({
        name: "IsSetNow",
        value,
      })
    );
  };

  return (
    <div className="relative flex flex-col gap-4 col-span-6 px-4 py-8 border rounded-xl h-40">
      <label className="top-0 right-4 absolute bg-white dark:bg-gray-gray12 px-4 text-sm -translate-y-1/2">
        {label ?? t("general.startDateAndTime")}
      </label>

      <div className="!mb-0 w-full text-xs">
        <CustomCheckbox
          onChange={handleChangeCheckbox}
          checked={isNow}
          config={{ name: "IsSetNow", value: isNow }}
        />
        <span className="px-1 text-xs">{t("general.rightNow")}</span>
      </div>

      <div className="flex gap-2">
        <div className="!mb-0 !pb-0 w-full text-xs">
          <span
            className={`dark:text-white text-xs font-medium flex pb-2 ${
              isNow ? "text-gray-gray7" : "text-gray-gray10"
            }`}
          >
            {t("general.startDate")}
          </span>
          <NewDatePicker
            value={Value}
            className="w-full"
            config={config}
            disabled={isNow}
          />
        </div>

        <div className="!mb-0 !pb-0 w-full text-xs">
          <span
            className={`dark:text-white text-xs font-medium flex pb-2 ${
              isNow ? "text-gray-gray7" : "text-gray-gray10"
            }`}
          >
            {t("general.startTime")}
          </span>
          <NewTimePicker
            value={Value}
            className="!w-full"
            config={config}
            disabled={isNow}
          />
        </div>
      </div>
    </div>
  );
};

export default StartDateTimePicker;
