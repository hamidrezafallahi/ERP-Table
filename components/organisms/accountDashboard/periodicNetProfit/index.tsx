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
import LineChartNetProfit from './lineChartNetProfit';

const PeriodicNetProfit = () => {
  const t = useTranslations();
  const { viewData } = useAppSelector(
    (state) => ({
      viewData: state.withPersist.pages?.find((item) => item.isActive)
        ?.viewData,
    }),
    shallowEqual,
  );

  const { data: dataNetProfit } = useGetData({
    url: "/api/acc/select/periodicNetProfit",
    body: { StartDate: viewData?.StartDate, EndDate: viewData?.EndDate },
    skip: false,
  });

  const itemRaw = dataNetProfit?.Data?.[0];

  const item = {
    Current: itemRaw?.NetProfit,
    Previous: itemRaw?.Previous,
  };

  const { formattedCurrent, growthPercent, color, growth, currentList } =
    calculateFinance({ data: item });

  //   const chartData =
  //     currentList?.map((v) => ({
  //       value: v,
  //     })) ?? [];
  const chartData = currentList?.map((v) => ({ value: v })) ?? [
    { value: 10 },
    { value: 20 },
    { value: -5 },
    { value: 30 },
  ];

  return (
    <div className="flex flex-col gap-8 shadow-md p-4 rounded-xxl h-[336px]">
      <span className="text-base">{t("general.periodicNetProfit")}</span>
      <div className="flex flex-col gap-10 w-full">
        <div className="flex flex-col items-end gap-4 w-full">
          <span className="font-bold text-gray-gray10 text-2xl">
            {formattedCurrent}
          </span>
          <span
            className={`text-xl font-semibold inline-flex gap-1 items-center ${color}`}
          >
            {growth < 0 && <NegativeIcon config={{ width: 24, height: 24 }} />}
            {growth > 0 && <PositiveIcon config={{ width: 24, height: 24 }} />}
            <span>{growth !== 0 ? `${growthPercent}%` : "0%"}</span>
          </span>
        </div>
        <LineChartNetProfit data={chartData} />
      </div>
    </div>
  );
};

export default PeriodicNetProfit;
