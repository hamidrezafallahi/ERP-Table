import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IBankWithdrawal,
  IRequest,
} from "@services/trh/bankWithdrawal/type";

export default function BankWithdrawalListPage() {
  const t = useTranslations();
  return (
    <ViewList<IBankWithdrawal, IRequest>
      url="api/trh/select/bankStatement/withdrawal"
      deleteUrl="api/trh/delete/bankStatement"
      staticKey="BankStatementId"
      rowFieldKey="BankStatementId"
      formUrl="trh/bankWithdrawal"
      addCaption={t("general.addNew")}
      caption={"title.bankWithdrawalList"}
      baseRepoId={3020}
      pageIcon="BankWithdrawalIcon"
    />
  );
}
