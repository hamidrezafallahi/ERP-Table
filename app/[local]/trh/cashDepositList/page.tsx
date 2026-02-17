import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { ICashDeposit, IRequest } from "@services/trh/cashDeposit/type";

export default function CashDepositList() {
  const t = useTranslations();
  return (
    <ViewList<ICashDeposit, IRequest>
      url="api/trh/select/cashStatement/deposit"
      deleteUrl="api/trh/delete/cashStatement"
      staticKey="CashStatementId"
      rowFieldKey="CashStatementId"
      formUrl="trh/cashDeposit"
      addCaption={t("general.addNew")}
      caption={"title.cashDepositList"}
      baseRepoId={3018}
      pageIcon="CashDepositIcon"
    />
  );
}
