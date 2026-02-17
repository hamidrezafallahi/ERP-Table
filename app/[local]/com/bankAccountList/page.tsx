import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IBankAccount, IRequest } from "@services/com/bankAccount/type";

export default function BankAccountListPage() {
  const t = useTranslations();

  return (
    <ViewList<IBankAccount, IRequest>
      url="/api/com/select/bankAccount"
      deleteUrl="/api/com/delete/bankAccount"
      staticKey="AccountName"
      rowFieldKey="BankAccountId"
      formUrl="com/bankAccount"
      addCaption={t("general.addNew")}
      caption={"title.bankAccountList"}
      baseRepoId={106067}
      EditField="Bank.BankDesc"
      pageIcon="BankAccountIcon"
    />
  );
}
