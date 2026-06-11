import { MasterForm } from '@components/templates/form';
import {
  CheckDocumentOperationType,
} from '@components/templates/treasury/receiptAndPayment/cheque&promissoryNote/enum';
import IssuanceTemplate
  from '@components/templates/treasury/receiptAndPayment/cheque&promissoryNote/issuance';
import type {
  IChequeIssuance,
  IRequest,
} from '@services/trh/chequeIssuance/type';

export default function ChequeIssuanceFormPage() {
  return (
    <MasterForm<IChequeIssuance, IRequest>
       caption={"title.chequeIssuance"}
      detailFieldKey="VoucherDetailId"
      headerFieldKey="VoucherHeaderId"
      listUrl="trh/chequeIssuanceList"
       pageIcon="ChequeIssuanceIcon"
      addUrl="api/trh/insert/check/issuance"
      updateUrl="api/trh/update/check/issuance"
      tableTitle="اقلام"
      Component={IssuanceTemplate}
      headerGetUrl="api/trh/select/check/issuance"
      detailGetUrl="api/trh/select/checkDetail/issuance"
      type={CheckDocumentOperationType.IssuedCheck}
      DefaultHeaderRepoViewId={3023}
      DefaultDetailRepoViewId={3022}
      storeName="chequeIssuance"
    />
  );
}
