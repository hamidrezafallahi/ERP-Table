import Form from "@components/templates/form";
import type { IRequest, IVoucher } from "@services/acc/voucher/type";

export default function VoucherFormPage() {
  return (
    <Form<IVoucher, IRequest>
      titleKey="VoucherHeaderId"
      fieldKey="VoucherHeaderId"
      caption={"title.voucher"}
      url="/api/acc/select/voucher"
      listUrl="acc/voucherList"
    />
  );
}
