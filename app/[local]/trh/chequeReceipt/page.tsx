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

export default function ChequeReceiptFormPage() {
  return (
    <MasterForm<IChequeReceipt, IRequest>
       caption={"title.chequeReceipt"}
      addUrl="api/trh/insert/check/receipt"
      updateUrl="api/trh/update/check/receipt"
      listUrl="trh/chequeReceiptList"
      pageIcon="ChequeReceiptIcon"
      tableTitle="اقلام"
      detailFieldKey="CheckReceiptDetailId"
      headerFieldKey="CheckReceiptHeaderId"
      headerGetUrl="api/trh/select/check/receipt"
      detailGetUrl="api/trh/select/checkDetail/receipt"
      Component={Receipt_DeployTemplate}
      type={CheckDocumentOperationType.ReceiveCheck}
      DefaultHeaderRepoViewId={140018}
      DefaultDetailRepoViewId={140017}
      storeName='receiptAndPayment'
    />
  );
}
