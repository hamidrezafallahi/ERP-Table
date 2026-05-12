import React from 'react';

import {
  Divider,
  FormInstance,
} from 'antd';

import ReportHeaderFilters
  from '@components/templates/report/partials/filters/reportHeaderFilters';

import { ReloadType } from '../../types';
import CustomForm from './customForm';

interface ContextHeaderProps {
  typeId: number;
  refetchCard: ReloadType;
  refetchTable: ReloadType;
  sidebarForm: FormInstance<any>;
}

export function ContextHeader(props: ContextHeaderProps) {
  const { typeId, refetchCard, refetchTable , sidebarForm} = props;
  return (
    <>
  <ReportHeaderFilters
  thirdActionHandler={()=>{console.log("thirdActionHandler")}}
  />
       <CustomForm
        typeId={typeId}
        refetchCard={refetchCard}
        refetchTable={refetchTable}
        sidebarForm={sidebarForm}
      />
      <Divider className="my-2" />
    </>
  );
}
