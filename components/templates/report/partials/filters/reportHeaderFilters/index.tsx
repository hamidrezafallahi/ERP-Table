import React from 'react';

import moment from 'moment-jalaali';
import { useLocale } from 'next-intl';
import {
  RangePicker,
  TLocale,
} from 'react-persian-range-picker';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { MoreVertical } from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import { setViewData } from '@slice/pages';

import { FilterSection } from './filterSection';
import { ReportHeaderFilterProps } from './type';

export default function ReportHeaderFilters({
  ...props
}: ReportHeaderFilterProps) {
  const { defaultFilter, defaultRange } = props;
  const { showThirdAction = true, thirdActionHandler } = props;
  const dispatch = useDispatch();
  const locale = useLocale() as TLocale;
  const { activePage } = useAppSelector((state) => {
    const activePage = state.withPersist.pages.find((p) => p.isActive);
    return { activePage };
  }, shallowEqual);
  return (
    <div className="flex justify-start gap-4 w-full">
      <RangePicker
        defaultValue={defaultRange}
        // renderPosition={{ align: "start" }}
        isShowNavigationButton
        model="date"
        // label={false}
        exportType="IsoString"
        locale={locale}
        onChange={(e: any) => {
          if (["day", "week", "month", "year"].includes(e.type)) {
            dispatch(
              setViewData({
                ...activePage.viewData,
                FromDate:
                  locale == "fa"
                    ? moment(e.Data.date.from)
                        .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
                        .replace(/[۰-۹]/g, (d) =>
                          "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString(),
                        )
                    : moment.utc(e.Data.date.from).toISOString(),
                ToDate:
                  locale == "fa"
                    ? moment(e.Data.date.to)
                        .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
                        .replace(/[۰-۹]/g, (d) =>
                          "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString(),
                        )
                    : moment.utc(e.Data.date.to).toISOString(),
              }),
            );
          }
        }}
        onCompareDateChange={(e) => {
          console.log(e);
        }}
        buttonStyle={{ background: "#f00" }}
      />
      <FilterSection defaultFilter={defaultFilter} />
      {showThirdAction && (
        <CustomButton
          type="text"
          className="bg-gray-gray3 p-1 w-9 h-9"
          onClick={thirdActionHandler}
        >
          <MoreVertical />
        </CustomButton>
      )}
    </div>
  );
}
