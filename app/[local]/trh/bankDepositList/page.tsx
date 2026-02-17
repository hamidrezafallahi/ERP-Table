import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IBankDeposit, IRequest } from "@services/trh/bankDeposit/type";

export default function BankDepositListPage() {
  const t = useTranslations();
  return (
    <ViewList<IBankDeposit, IRequest>
      url="api/trh/select/bankStatement/deposit"
      deleteUrl="api/trh/delete/bankStatement"
      staticKey="BankStatementId"
      rowFieldKey="BankStatementId"
      formUrl="trh/bankDeposit"
      addCaption={t("general.addNew")}
      caption={"title.bankDepositList"}
      baseRepoId={3012}
      pageIcon="BankDepositIcon"
    />
  );
}
