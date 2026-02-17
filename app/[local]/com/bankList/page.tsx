import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IBank, IRequest } from "@services/com/bank/type";

export default function BankListPage() {
  const t = useTranslations();

  return (
    <ViewList<IBank, IRequest>
      url="/api/com/select/bank"
      deleteUrl="/api/com/delete/bank"
      staticKey="BankDesc"
      rowFieldKey="BankId"
      formUrl="com/bank"
      addCaption={t("general.addNew")}
      caption={"title.bankList"}
      baseRepoId={106004}
      EditField="BankDesc"
    />
  );
}
