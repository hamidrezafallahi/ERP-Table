"use client";

import React, { useEffect, useRef, useState } from "react";

import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";
import type { IPage } from "@slice/pages/type";
import { IFormFieldConfig } from "@type/elementType";

import CustomCheckbox from "../checkbox";
import { NewDatePicker } from "../newDatePicker";
import { NewTimePicker } from "../newTimePicker";

interface ExpireDateTimePickerProps {
  initialShowEndDate?: boolean;
  config?: IFormFieldConfig;
}

const EndDateTimePicker = ({
  initialShowEndDate = true,
  config,
}: ExpireDateTimePickerProps) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const datePickerRef = useRef(null);
  const [showEndDate, setShowEndDate] = useState<boolean>(initialShowEndDate);

  const selectActivePage = (state: any) =>
    state?.withPersist?.pages?.find((item: IPage) => item?.isActive);

  const { reduxValue, expireDate, defaultValue, Value } = useAppSelector(
    (state) => {
      const activePage = selectActivePage(state);
      const pageData = activePage?.pageData ?? [];

      return {
        reduxValue: pageData.find((item: any) => item?.name === config?.name)
          ?.originalValue,
        expireDate: pageData.find((item: any) => item?.name === "ExpireDate")
          ?.originalValue,
        defaultValue: pageData.find((item: any) => item?.name === config?.name)
          ?.originalValue,
        Value: activePage?.pageData?.find((pd) => pd?.name === config?.name)
          ?.value,
      };
    },
    shallowEqual
  );

  useEffect(() => {
    if (typeof reduxValue === "boolean") {
      setShowEndDate(reduxValue);
    }
  }, [reduxValue]);

  useEffect(() => {
    if (expireDate) {
      setShowEndDate(false);
    }
  }, [expireDate]);

  const handleCheckboxChange = (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked;
    setShowEndDate(isChecked);
    dispatch(
      setPageData({
        name: config?.name,
        value: isChecked ? null : datePickerRef.current,
      })
    );
  };

  return (
    <div className="relative flex flex-col justify-around gap-2 col-span-6 px-4 py-8 border rounded-xl h-40">
      <label className="top-0 right-4 absolute flex gap-2 bg-white dark:bg-gray-gray12 px-4 text-sm -translate-y-1/2">
        <span>{t("general.endDateAndTime")}</span>
      </label>

      <div className="w-full text-xs">
        <CustomCheckbox
          type="checkbox"
          checked={showEndDate}
          onChange={handleCheckboxChange}
        />
        <span className="px-1 text-xs">{t("general.withoutEnd")}</span>
      </div>

      <div className="flex gap-2">
        <div className="!mb-0 !pb-0 w-full text-xs">
          <span
            className={`text-xs font-medium flex pb-2 dark:text-white ${
              showEndDate ? "text-gray-gray7" : "text-gray-gray10"
            }`}
          >
            {t("general.endDate")}
          </span>
          <NewDatePicker
            value={Value}
            className="w-full"
            config={config}
            disabled={showEndDate}
            defaultValue={defaultValue}
          />
        </div>
        <div className="!mb-0 !pb-0 w-full text-xs">
          <span
            className={`text-xs font-medium flex pb-2 dark:text-white ${
              showEndDate ? "text-gray-gray7" : "text-gray-gray10"
            }`}
          >
            {t("general.endTime")}
          </span>
          <NewTimePicker
            className="!w-full"
            config={config}
            disabled={showEndDate}
            defaultValue={defaultValue}
            value={Value}
          />
        </div>
      </div>
    </div>
  );
};

export default EndDateTimePicker;
