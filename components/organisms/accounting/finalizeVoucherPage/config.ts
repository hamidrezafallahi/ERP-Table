import moment from 'moment';

import type { IFormFieldConfig } from '@type/elementType';

export const formConfig: IFormFieldConfig[] = [
  {
    name: "Date",
    caption: "تا تاریخ",
    type: "date",
    value:  moment(new Date()).toISOString(),
    originalValue:  moment(new Date()).toISOString(),
    isTitleField: false,
  },
];
