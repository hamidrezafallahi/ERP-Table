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

export default function promissoryNoteDeployFormPage() {
  return (
    <MasterForm<IChequeReceipt, IRequest>
      caption={"title.promissoryNoteDeploy"}
      addUrl="api/trh/insert/check/DeployPromissoryNote"
      updateUrl="api/trh/update/check/DeployPromissoryNote"
      listUrl="trh/promissoryNoteDeployList"
      pageIcon="ChequeReceiptIcon"
      tableTitle="اقلام"
      detailFieldKey="CheckReceiptDetailId"
      headerFieldKey="CheckReceiptHeaderId"
      headerGetUrl="api/trh/select/check/DeployPromissoryNote"
      detailGetUrl="api/trh/select/checkDetail/receipt"
      Component={Receipt_DeployTemplate}
      type={CheckDocumentOperationType.DeployPromissoryNote}
      DefaultHeaderRepoViewId={140018}
      DefaultDetailRepoViewId={140017}
      storeName="receiptAndPayment"
    />
  );
}
