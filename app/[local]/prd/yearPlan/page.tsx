import React from 'react';

import { Form } from '@components/templates/form';
import {
  IRequest,
  IYearPlan,
} from '@services/prd/yearPlan/type';

function YearPlanPage() {
  return ( <Form<IYearPlan, IRequest>
        titleKey="YearPlanNumber"
        fieldKey="YearPlanId"
        caption={"title.yearPlan"}
        url="/api/prd/select/yearPlan"
        listUrl="prd/yearPlanList"
      />
  );
}

export default YearPlanPage;
