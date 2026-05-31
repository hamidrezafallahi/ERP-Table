"use client";
import React, { useEffect } from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import Title from '@components/atoms/Title';
import AccountBalance
  from '@components/organisms/accountDashboard/accountBalance';
import AccountDashboardHeader
  from '@components/organisms/accountDashboard/accountDashboardHeader';
import DonutChart from '@components/organisms/accountDashboard/donutChart';
import FinancialRatios
  from '@components/organisms/accountDashboard/financialRatios';
import GaugeChart from '@components/organisms/accountDashboard/gaugeChart';
import PeriodFinancial
  from '@components/organisms/accountDashboard/periodFinancial';
import Periodic from '@components/organisms/accountDashboard/periodic';
import PeriodicNetProfit
  from '@components/organisms/accountDashboard/periodicNetProfit';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { addNewPage } from '@slice/pages';
import { HeaderTypeEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';

const AccountDashboardTemplate = () => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { initPage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
    }),
    shallowEqual,
  );

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: "title.accountDashboard",
        icon: "IssuingProformaInvoiceIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "acc/accountDashboard",
        listPageId: initPage?.listPageId,
        headerType: HeaderTypeEnum.MobileWithoutSearch,
        returnPageId: initPage.pageId,
      }),
    );
  }, []);

  return (
    <>
      <Title caption={"title.accountDashboard"} />
      <div className="hidden-show-scrollBar flex flex-col gap-4 mt-4 lg:mt-0 pb-4 h-[calc(100dvh-6rem)] lg:h-[calc(100dvh-9rem)] overflow-y-scroll">
        <AccountDashboardHeader />
        <div className="gap-4 grid grid-cols-12">
          <div className="col-span-12 lg:col-span-6 shadow-md mx-[0.125rem] lg:mx-0 p-4 rounded-xxl h-[336px]">
            <span className="text-lg">{t("general.profitMargin")}</span>
            <GaugeChart />
          </div>
          <div className="flex xs:flex-row flex-col sm:flex-col lg:flex-col gap-4 col-span-12 sm:col-span-6 lg:col-span-3 mx-[0.125rem] lg:mx-0">
            <Periodic title="periodicRevenue" />
            <Periodic title="periodicExpense" />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 mx-[0.125rem] lg:mx-0">
            <PeriodicNetProfit />
          </div>
        </div>
        <div className="gap-4 grid grid-cols-12">
          <div className="flex sm:flex-row flex-col lg:flex-col gap-4 col-span-12 lg:col-span-6 mx-[0.125rem] lg:mx-0 h-auto">
            <DonutChart />
            <div className="sm:flex lg:flex-row sm:flex-col gap-4 grid lg:grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-1 lg:grid-cols-3 col-span-12 lg:col-span-6 md:w-1/3 lg:w-full">
              <FinancialRatios title="profittoRevenueRatio" />
              <FinancialRatios title="expenseToRevenueRatio" />
              <FinancialRatios title="debtToAssetRatio" />
            </div>
          </div>
          <div className="flex flex-col gap-4 col-span-12 lg:col-span-6 mx-[0.125rem] lg:mx-0">
            <div className="gap-4 grid grid-cols-1 lg:grid-cols-3 s:grid-cols-3">
              <PeriodFinancial title="periodicAsset" />
              <PeriodFinancial title="periodicEquity" />
              <PeriodFinancial title="periodicLiability" />
            </div>
            <div className="gap-4 grid grid-cols-1 lg:grid-cols-2 s:grid-cols-2 mb-0 lg:mb-4">
              <AccountBalance title="remainOFBankAccounts" />
              <AccountBalance title="remainOFCashAccounts" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountDashboardTemplate;
