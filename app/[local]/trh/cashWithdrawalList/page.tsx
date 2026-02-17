import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  ICashWithdrawal,
  IRequest,
} from "@services/trh/cashWithdrawal/type";

export default function CashWithdrawalList() {
  const t = useTranslations();
  return (
    <ViewList<ICashWithdrawal, IRequest>
      url="api/trh/select/cashStatement/withdrawal"
      deleteUrl="api/trh/delete/cashStatement"
      staticKey="CashStatementId"
      rowFieldKey="CashStatementId"
      formUrl="trh/cashWithdrawal"
      addCaption={t("general.addNew")}
      caption={"title.cashWithdrawalList"}
      baseRepoId={3019}
      pageIcon="CashWithdrawalIcon"
    />
  );
}
