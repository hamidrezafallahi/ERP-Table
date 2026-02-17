import Form from "@components/templates/form";
import type {
  IChequeIssuance,
  IRequest,
} from "@services/trh/chequeIssuance/type";

export default function ChequeIssuanceFormPage() {
  return (
    <Form<IChequeIssuance, IRequest>
      fieldKey="CheckIssuanceHeaderId"
      caption={"title.chequeIssuance"}
      url="api/trh/select/check/issuance"
      listUrl="trh/chequeIssuanceList"
      titleKey="VoucherNumber"
      pageIcon="ChequeIssuanceIcon"
    />
  );
}
