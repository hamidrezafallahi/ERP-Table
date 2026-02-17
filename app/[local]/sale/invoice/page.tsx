import Form from "@components/templates/form";
import type {
  IChequeReceipt,
  IRequest,
} from "@services/trh/chequeReceipt/type";

export default function InvoiceFormPage() {
  return (
    <Form<IChequeReceipt, IRequest>
      fieldKey="CheckReceiptHeaderId" //
      caption={"title.invoice"}
      url="api/trh/select/check/receipt" //
      listUrl="sale/invoice"
      titleKey="VoucherNumber" //
      pageIcon=""
    />
  );
}
