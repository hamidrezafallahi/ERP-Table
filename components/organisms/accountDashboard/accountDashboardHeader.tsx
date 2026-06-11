import React from 'react';

import moment from 'moment';
import {
  useLocale,
  useTranslations,
} from 'next-intl';
import {
  RangePicker,
  TLocale,
} from 'react-persian-range-picker';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import DateBox from '@components/molecules/dateBox';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import { setViewData } from '../../../slice/pages';

const AccountDashboardHeader = () => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const locale = useLocale() as TLocale;
  const { activePage } = useAppSelector((state) => {
    const activePage = state.withPersist.pages?.find((p) => p.isActive);
    const match = state.withPersist.config.initMatch;
    return { activePage, match };
  }, shallowEqual);

  return (
    <div className="gap-4 grid grid-cols-12">
      <div className="col-span-12 lg:col-span-6 p-4 border rounded-xxl w-full h-16">
        <DateBox />
      </div>
      <div className="flex items-center gap-2 col-span-12 lg:col-span-6 p-4 lg:py-0 border rounded-xxl w-full lg:h-16">
        <span className="text-lg">{t("general.date")}</span>
        <RangePicker
          label={false}
          onSubmit={(e: any) => {
            dispatch(
              setViewData({
                ...activePage?.viewData,
                StartDate:
                  locale == "fa"
                    ? moment(e.Data.date.from)
                        .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
                        .replace(/[۰-۹]/g, (d) =>
                          "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString(),
                        )
                    : moment.utc(e.Data.date.from).toISOString(),
                EndDate:
                  locale == "fa"
                    ? moment(e.Data.date.to)
                        .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
                        .replace(/[۰-۹]/g, (d) =>
                          "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString(),
                        )
                    : moment.utc(e.Data.date.to).toISOString(),
              }),
            );
          }}
        />
      </div>
    </div>
  );
};

export default AccountDashboardHeader;
