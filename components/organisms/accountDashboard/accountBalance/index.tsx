import React from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { NoData } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';

import {
  AccountBalanceItemType,
  CashBalanceResponse,
} from './types';

interface AccountBalanceProps {
  title: string;
}

const AccountBalance = (props: AccountBalanceProps) => {
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

  const { data: dataRemainOFBank } = useGetData({
    url: "/api/acc/select/RemainOFBankAccounts",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });

  const { data: dataRemainOFCash } = useGetData<CashBalanceResponse>({
    url: "/api/acc/select/RemainOFCashAccounts",
    body: { StartDate: SDate, EndDate: EDate },
    skip: false,
  });

  const data: AccountBalanceItemType[] =
    title === "remainOFBankAccounts"
      ? dataRemainOFBank?.Data?.[0]?.BankBalance
      : dataRemainOFCash?.Data?.[0]?.CashBalance;

  const headerTitle = t(`general.${title}` as string);

  return (
    <div className="flex flex-col gap-4 bg-white shadow-md p-4 rounded-xxl min-h-[19.125rem] max-h-[19.125rem] overflow-hidden">
      <span className="text-base">{headerTitle}</span>
      {data?.length ? (
        <div className="flex flex-col flex-1 min-h-48">
          <table className="w-full text-right border-collapse shrink-0">
            <thead>
              <tr className="border-gray-50 border-b font-light text-gray-400 text-sm">
                <th className="px-2 pb-3 font-medium text-center">ارز</th>
                <th className="px-2 pb-3 font-medium text-center">مبلغ</th>
              </tr>
            </thead>
          </table>
          <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
            <table className="w-full text-right border-collapse">
              <tbody className="text-gray-700">
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    <td className="py-4 border-gray-50 border-b text-sm text-right truncate">
                      {item.CurrencyName}
                    </td>
                    <td className="py-4 border-gray-50 border-b font-semibold text-gray-900 text-sm text-left">
                      {item.TotalAmount?.toLocaleString("fa-IR") ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 justify-center items-center gap-2 min-h-0">
          <NoData config={{ width: 60, height: 60 }} />
          <p className="text-gray-gray6 text-sm">
            داده‌ای برای نمایش وجود ندارد.
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountBalance;
