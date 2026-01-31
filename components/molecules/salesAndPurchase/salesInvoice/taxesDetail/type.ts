import { Dispatch } from "react";

import type { IActions } from "@components/molecules/detailDataGrid/type";
import type { ISalesInvoiceDetails } from "@services/sale/salesInvoiceDetails/type";

export interface IProps {
  type?: "JEWELRY";
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
}
