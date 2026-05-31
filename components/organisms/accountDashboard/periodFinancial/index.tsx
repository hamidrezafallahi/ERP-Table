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
import { PeriodFinancialResponse } from './types';

interface PeriodFinancialProps {
  title: string;
}

const PeriodFinancial = (props: PeriodFinancialProps) => {
  const { title } = props;
  const t = useTranslations();
  const { viewData } = useAppSelector(
    (state) => ({
      viewData: state.withPersist.pages?.find((item) => item.isActive)?.viewData,
    }),
    shallowEqual,
  );

  const SDate = viewData?.StartDate;
  const EDate = viewData?.EndDate;

  const { data: dataLiability } = useGetData<PeriodFinancialResponse>({
    url: "/api/acc/select/PreiodicLiability",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });
  const { data: dataEquity } = useGetData<PeriodFinancialResponse>({
    url: "/api/acc/select/PreiodicEquity",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });
  const { data: dataAsset } = useGetData<PeriodFinancialResponse>({
    url: "/api/acc/select/PeriodicAsset",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });

  const data =
    title === "periodicLiability"
      ? dataLiability?.Data
      : title === "periodicEquity"
        ? dataEquity?.Data
        : dataAsset?.Data;

  const item = data?.[0];
  const { formattedCurrent, growthPercent, color, growth } =
    calculateFinance({data:item});

  const headerTitle = t(`general.${title}` as string);

  return (
    <div className="flex flex-col gap-4 shadow-md p-4 rounded-xxl w-full h-[160px]">
      <span className="text-base">{headerTitle}</span>
      <div className="flex flex-col items-end gap-4 w-full">
        <span className="font-bold text-gray-gray10 text-sm">
          {formattedCurrent}
        </span>
        <span
          className={`text-xs font-semibold inline-flex gap-1 items-center ${color}`}
        >
          {growth < 0 && <NegativeIcon config={{ width: 24, height: 24 }} />}
          {growth > 0 && <PositiveIcon config={{ width: 24, height: 24 }} />}
          <span>{growth !== 0 ? `${growthPercent}%` : "0%"}</span>
        </span>
        <div className="flex justify-between w-full">
          <span className="font-bold text-gray-gray6 text-xs">باقیمانده:</span>
          <span className="font-bold text-gray-gray6 text-xs">
            {Math.abs(item?.Remain).toLocaleString("fa-IR")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PeriodFinancial;
