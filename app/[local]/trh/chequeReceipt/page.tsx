import Form from "@components/templates/form";
import type {
  IChequeReceipt,
  IRequest,
} from "@services/trh/chequeReceipt/type";

export default function ChequeReceiptFormPage() {
  return (
    <Form<IChequeReceipt, IRequest>
      fieldKey="CheckReceiptHeaderId"
      caption={"title.chequeReceipt"}
      url="api/trh/select/check/receipt"
      listUrl="trh/chequeReceiptList"
      titleKey="VoucherNumber"
      pageIcon="ChequeReceiptIcon"
    />
  );
}
