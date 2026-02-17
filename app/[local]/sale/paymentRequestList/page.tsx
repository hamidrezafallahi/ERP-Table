import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IChequeIssuance,
  IRequest,
} from "@services/trh/chequeIssuance/type";

export default function PaymentRequestListPage() {
  const t = useTranslations();
  return (
    <ViewList<IChequeIssuance, IRequest>
      url="api/trh/select/check/issuance"
      deleteUrl="api/trh/delete/check/issuance"
      staticKey="VoucherNumber"
      staticKeyII="VoucherDate"
      rowFieldKey="CheckIssuanceHeaderId"
      formUrl="trh/chequeIssuance"
      addCaption={t("general.addNew")}
      caption={"title.chequeIssuanceList"}
      baseRepoId={1081}
      pageIcon="ChequeIssuanceIcon"
    />
  );
}
