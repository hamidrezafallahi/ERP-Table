import React, {
  Dispatch,
  SetStateAction,
} from 'react';

import {
  Divider,
  FormInstance,
} from 'antd';

import ReportHeaderFilters
  from '@components/templates/report/partials/filters/reportHeaderFilters';
import { filterTypeNumberEnum } from '@services/base/type';
import { IViewData } from '@slice/pages/type';

import CustomForm from './customForm';
import { filterFields } from './filterConfig';

interface ContextHeaderProps {
  setMutateIsLoading: Dispatch<SetStateAction<boolean>>;
  sidebarForm: FormInstance<any>;
  setReportState: Dispatch<
    SetStateAction<{
      viewDataFilter: Partial<IViewData>;
      tableData: any[];
      cardData: any;
    }>
  >;
}

export function ContextHeader(props: ContextHeaderProps) {
  const { sidebarForm, setReportState, setMutateIsLoading } = props;
  return (
    <>
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
          ]}
        />
      </div>
      <CustomForm
        setMutateIsLoading={setMutateIsLoading}
        sidebarForm={sidebarForm}
        setReportState={setReportState}
      />
      <Divider className="my-2" />
    </>
  );
}
