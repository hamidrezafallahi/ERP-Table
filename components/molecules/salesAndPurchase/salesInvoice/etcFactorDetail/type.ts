import { Dispatch } from "react";

import type { IActions } from "@components/molecules/detailDataGrid/type";
import type { ISalesInvoiceDetails } from "@services/sale/salesInvoiceDetails/type";

export interface IProps {
  detailRequiredValue: number;
  // totalDetailAmount: number;
  detailConfigModal: {
    record: ISalesInvoiceDetails;
    index: number;
    helpers: {
      detailData: ISalesInvoiceDetails[];
      dispatchDetailData: Dispatch<IActions<ISalesInvoiceDetails>>;
    };
  };
  calcIndependentValue?: (
    rowData: ISalesInvoiceDetails,
    fieldName: string,
    newValue: any
  ) => Promise<Partial<ISalesInvoiceDetails> | undefined>;
}
