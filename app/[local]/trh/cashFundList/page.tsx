import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { ICashFund, IRequest } from "@services/trh/cashFund/type";

export default function CashFundListPage() {
  const t = useTranslations();

  return (
    <ViewList<ICashFund, IRequest>
      url="/api/trh/select/tankhah"
      deleteUrl="/api/trh/delete/tankhah"
      staticKey="CashDesc"
      rowFieldKey="CashId"
      formUrl="trh/cashFund"
      addCaption={t("general.addNew")}
      caption={"title.cashFundList"}
      baseRepoId={3009}
      EditField="CashCode"
    />
  );
}
