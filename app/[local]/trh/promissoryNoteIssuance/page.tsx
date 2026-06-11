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
       caption={"title.promissoryNoteIssuance"}
      detailFieldKey="VoucherDetailId"
      headerFieldKey="VoucherHeaderId"
      listUrl="trh/promissoryNoteIssuanceList"
      // titleKey="VoucherNumber"
      pageIcon="ChequeIssuanceIcon"
      addUrl="api/trh/insert/check/issuePromissoryNote"
      updateUrl="api/trh/update/check/issuePromissoryNote"
      tableTitle="اقلام"
      Component={IssuanceTemplate}
      headerGetUrl="api/trh/select/check/IssuePromissoryNote"
      detailGetUrl="api/trh/select/checkDetail/issuance"
      type={CheckDocumentOperationType.IssuedPromissoryNote}
      DefaultHeaderRepoViewId={3023}
      DefaultDetailRepoViewId={3022}
      storeName='chequeIssuance'
    />
  );
}
