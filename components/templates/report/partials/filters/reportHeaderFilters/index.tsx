import React, { useEffect } from 'react';

import moment from 'moment-jalaali';
import { useLocale } from 'next-intl';
import {
  AdditionalElementType,
  RangePicker,
  TLocale,
} from 'react-persian-range-picker';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { MoreVertical } from '@components/atoms/iconComponents';
import FinancialYear from '@components/molecules/financialYear';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  setPageFilters,
  setViewData,
} from '@slice/pages';

import { FilterSection } from './filterSection';
import { ReportHeaderFilterProps } from './type';

export default function ReportHeaderFilters({
  ...props
}: ReportHeaderFilterProps) {
  const { defaultFilters, defaultRange, filterFields } = props;
  const { showThirdAction = true, thirdActionHandler } = props;
  const dispatch = useDispatch();
  const locale = useLocale() as TLocale;
  const { activePage, match } = useAppSelector((state) => {
    const activePage = state.withPersist.pages?.find((p) => p.isActive);
    const match = state.withPersist.config.initMatch;
    return { activePage, match };
  }, shallowEqual);
  const template: AdditionalElementType[] = [
    {
      key: "financial",
      label: "سال مالی",
      content: (
        <FinancialYear
          value={activePage?.viewData?.YearIds ?? []}
          onChange={(e) => {
            console.log(e);
            // HandleSubmitDate("financial", e);
          }}
        />
      ),
    } 
  ];

  useEffect(() => {
    if (!activePage?.viewData?.Filters && (defaultFilters || defaultRange)) {
      dispatch(
        setPageFilters({
          Filters: {
            ...activePage?.viewData?.Filters,
            FilterInfo: defaultFilters,
          },
          StartDate: defaultRange?.from,
          EndDate: defaultRange?.to,
        }),
      );
    }
  }, [activePage?.pageId]);

  return (
    <>
      <RangePicker
        showComparison={false}
        defaultValue={defaultRange}
        renderPosition={{ align: locale == "fa" ? "end" : "start", offset: 4 }}
        isShowNavigationButton
        model="date"
        additionalElement={template}
        label={false}
        exportType="IsoString"
        locale={locale}
        // activeTable = "Month"
        onChange={(e: any) => {
          console.log(e);
          dispatch(
            setViewData({
              ...activePage.viewData,
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
        // buttonStyle={{ height: "36px", transform: "translateY(-4px)" }}
        buttonStyle={{ height: "36px"}}
      />
      <FilterSection
        defaultFilters={
          activePage?.viewData?.Filters?.FilterInfo ?? defaultFilters
        }
        filterFields={filterFields}
      />
      {!match && showThirdAction && (
        <CustomButton
          type="text"
          className="bg-gray-gray3 p-1 w-9 h-9"
          onClick={thirdActionHandler}
        >
          <MoreVertical />
        </CustomButton>
      )}
    </>
  );
}
