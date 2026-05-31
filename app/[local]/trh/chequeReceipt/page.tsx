import ChequeReceiptTemplate
  from '@components/organisms/receiptAndPayment/cheque/receipt';
import { MasterForm } from '@components/templates/form';
import type {
  IChequeReceipt,
  IRequest,
} from '@services/trh/chequeReceipt/type';

export default function ChequeReceiptFormPage() {
  return (
    <MasterForm<IChequeReceipt, IRequest>
      fieldKey="CheckReceiptHeaderId"
      caption={"title.chequeReceipt"}
      captionII=""
      addUrl="api/trh/insert/check/receipt"
      updateUrl="api/trh/update/check/receipt"
      listUrl="trh/chequeReceiptList"
      pageIcon="ChequeReceiptIcon"
      tableTitle="اقلام"
      titleKey="VoucherNumber"
      detailFieldKey=""
      headerFieldKey=""
      headerGetUrl="api/trh/select/check/receipt"
      detailGetUrl="api/trh/select/checkDetail/receipt"
      Component={ChequeReceiptTemplate}
 
    />
  );
}
