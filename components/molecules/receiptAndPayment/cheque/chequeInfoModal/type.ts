import type { IChequeDetails } from "@services/trh/chequeDetails/type";

export interface IProps {
  handlePrevStep: () => Promise<void>;
  data: IChequeDetails;
}
