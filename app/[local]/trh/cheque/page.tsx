import Form from "@components/templates/form";
import type { ICheque, IRequest } from "@services/trh/cheque/type";

export default function CashFundFormPage() {
  return (
    <Form<ICheque, IRequest>
      fieldKey="CheckPlaceMentId"
      caption={"title.cheque"}
      url="/api/trh/select/checkPlacement"
      listUrl="trh/chequeList"
      titleKey="BanksAccount"
      pageIcon="File"
    />
  );
}
