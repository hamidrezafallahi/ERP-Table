import React from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  NegativeIcon,
  PositiveIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';

import { calculateFinance } from '../utils/finance';
import { PeriodicResponse } from './types';

interface PeriodicProps {
  title: string;
}

const Periodic = (props: PeriodicProps) => {
  const { title } = props;
  const t = useTranslations();
  const { viewData } = useAppSelector(
    (state) => ({
      viewData: state.withPersist.pages?.find((item) => item.isActive)
        ?.viewData,
    }),
    shallowEqual,
  );

  const SDate = viewData?.StartDate;
  const EDate = viewData?.EndDate;

  const { data: dataRevenue } = useGetData<PeriodicResponse>({
    url: "/api/acc/select/PeriodicRevenue",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });
  const { data: dataExpense } = useGetData<PeriodicResponse>({
    url: "/api/acc/select/PeriodicExpense",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });

  const data =
    title === "periodicRevenue" ? dataRevenue?.Data : dataExpense?.Data;
  const item = data?.[0];

  const { formattedCurrent, growthPercent, color, growth } = calculateFinance({
    title,
    data: item,
  });

  const headerTitle = t(`general.${title}` as string);
  const isExpense = title.includes("Expense");
  const showPositiveIcon = isExpense ? growth < 0 : growth > 0;
  const showNegativeIcon = isExpense ? growth > 0 : growth < 0;

  return (
    <div className="flex flex-col gap-4 shadow-md p-4 rounded-xxl w-full h-[160px]">
      <span className="text-base">{headerTitle}</span>
      <div className="flex flex-col items-end gap-4 w-full">
        <span className="font-bold text-gray-gray10 text-lg">
          {formattedCurrent}
        </span>
        <span
          className={`text-base font-semibold inline-flex gap-1 items-center ${color}`}
        >
          {showNegativeIcon && (
            <NegativeIcon config={{ width: 24, height: 24 }} />
          )}
          {showPositiveIcon && (
            <PositiveIcon config={{ width: 24, height: 24 }} />
          )}
          <span>{growth !== 0 ? `${growthPercent}%` : "0%"}</span>
        </span>
      </div>
    </div>
  );
};

export default Periodic;
