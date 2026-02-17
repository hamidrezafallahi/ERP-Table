import Form from "@components/templates/form";
import type {
  IChequeReceipt,
  IRequest,
} from "@services/trh/chequeReceipt/type";

export default function PriceAnnouncementFormPage() {
  return (
    <Form<IChequeReceipt, IRequest>
      fieldKey="CheckReceiptHeaderId" //
      caption={"title.paymentRequest"}
      url="api/trh/select/check/receipt" //
      listUrl="sale/paymentRequestList"
      titleKey="VoucherNumber" //
      pageIcon=""
    />
  );
}
