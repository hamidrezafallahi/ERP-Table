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

export default function ChequeDeployFormPage() {
  return (
    <MasterForm<IChequeReceipt, IRequest>
      caption={"title.chequeDeploy"}
      addUrl="api/trh/insert/check/DeployCheck"
      updateUrl="api/trh/update/check/DeployCheck"
      listUrl="trh/chequeDeployList"
      pageIcon="ChequeReceiptIcon"
      tableTitle="اقلام"
      detailFieldKey="CheckReceiptDetailId"
      headerFieldKey="CheckReceiptHeaderId"
      headerGetUrl="api/trh/select/check/DeployCheck"
      detailGetUrl="api/trh/select/checkDetail/receipt"
      Component={Receipt_DeployTemplate}
      type={CheckDocumentOperationType.DeployCheck}
      DefaultHeaderRepoViewId={140018}
      DefaultDetailRepoViewId={140017}
      storeName='receiptAndPayment'

    />
  );
}
