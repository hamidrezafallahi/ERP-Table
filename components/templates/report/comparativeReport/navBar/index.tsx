import React from 'react';

import { useTranslations } from 'next-intl';

import { filterTypeNumberEnum } from '@services/base/type';

import ReportHeaderFilters from '../../partials/filters/reportHeaderFilters';
import { filterFields } from './filterConfig';

export default function ComparativeReportNavbar() {
  const t = useTranslations();
  return (
    <div className="flex justify-end gap-4 w-full">
      <ReportHeaderFilters
        filterFields={filterFields}
        defaultRange={{
          from: "2026-03-21T00:00:00.000+03:30",
          to: "2027-03-20T23:59:59.999+03:30",
        }}
        defaultFilters={[
          {
            ColName: "VoucherTypeIds",
            FilterType: filterTypeNumberEnum.Equal,
            Value: [5, 4, 3, 2, 1],
          },
          {
            ColName: "docStatusIds",
            FilterType: filterTypeNumberEnum.Equal,
            Value: [1, 2],
          },
        ]}
      />
    </div>
  );
}
