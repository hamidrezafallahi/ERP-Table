import { MasterForm } from '@components/templates/form';
import {
  CheckDocumentOperationType,
} from '@components/templates/treasury/receiptAndPayment/cheque&promissoryNote/enum';
import Receipt_DeployTemplate
  from '@components/templates/treasury/receiptAndPayment/cheque&promissoryNote/receipt&deploy';
import type {
  IChequeReceipt,
  IRequest,
} from '@services/trh/chequeReceipt/type';

export default function PromissoryNoteReceiptFormPage() {
  return (
    <MasterForm<IChequeReceipt, IRequest>
      caption={"title.promissoryNoteReceipt"}
      addUrl="api/trh/insert/check/ReceivePromissoryNote"
      updateUrl="api/trh/Update/check/ReceivePromissoryNote"
      listUrl="trh/promissoryNoteIssuanceList"
      pageIcon="ChequeReceiptIcon"
      tableTitle="اقلام"
      detailFieldKey="CheckReceiptDetailId"
      headerFieldKey="CheckReceiptHeaderId"
      headerGetUrl="api/trh/select/check/IssuePromissoryNote"
      detailGetUrl="api/trh/select/checkDetail/issuance"
      Component={Receipt_DeployTemplate}
      type={CheckDocumentOperationType.ReceivePromissoryNote}
      DefaultHeaderRepoViewId={140018}
      DefaultDetailRepoViewId={140017}
      storeName="receiptAndPayment"
    />
  );
}
