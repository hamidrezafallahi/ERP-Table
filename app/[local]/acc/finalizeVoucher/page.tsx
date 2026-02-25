import Form from "@components/templates/form";
import { IFinalizeVoucher ,IRequest } from "@services/acc/FinalizeVoucher/type";


export default function FinalizeVoucherPage() {
  return (
    <Form<IFinalizeVoucher, IRequest>
      titleKey=""
      fieldKey=""
      caption={"title.finalizeVoucher"}
      url={null}
      listUrl={null}
      submitCaption="قطعی کردن اسناد"
      hasShorthandFormToolbar={false}
    />
  );
}
