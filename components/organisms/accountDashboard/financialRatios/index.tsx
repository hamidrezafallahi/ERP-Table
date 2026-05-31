import React from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';

import { RatiosResponse } from './types';

interface FinancialRatiosProps {
  title: string;
}

const FinancialRatios = (props: FinancialRatiosProps) => {
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

  const { data: dataCalcNetToRevenue } = useGetData<RatiosResponse>({
    url: "/api/acc/select/CalcNetToRevenue",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });
  const { data: dataExpenseRate } = useGetData<RatiosResponse>({
    url: "/api/acc/select/ExpenseRate",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });
  const { data: dataDebtRatio } = useGetData<RatiosResponse>({
    url: "/api/acc/select/DebtRatio",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });

  const data =
    title === "profittoRevenueRatio"
      ? dataCalcNetToRevenue?.Data?.[0]?.RevneueToProfit
      : title === "expenseToRevenueRatio"
        ? dataExpenseRate?.Data?.[0]?.ExpenseRate
        : dataDebtRatio?.Data?.[0]?.DebtRatio;

  const valueRate = Number.isFinite(data) ? Math.abs(data).toFixed(2) : "0";
  
  const headerTitle = t(`general.${title}` as string);
  return (
    <div className="flex flex-col gap-6 shadow-md p-4 rounded-xxl h-[107px]">
      <span className="text-base truncate">{headerTitle}</span>
      <div className="flex flex-col items-end gap-4 w-full">
        <span className="inline-flex items-center gap-1 font-semibold text-base">
          {valueRate}
        </span>
      </div>
    </div>
  );
};

export default FinancialRatios;
