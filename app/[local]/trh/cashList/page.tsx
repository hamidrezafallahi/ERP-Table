import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { ICash, IRequest } from "@services/trh/cash/type";

export default function CashListPage() {
  const t = useTranslations();

  return (
    <ViewList<ICash, IRequest>
      url="/api/trh/select/cash"
      deleteUrl="/api/trh/delete/cash"
      staticKey="CashDesc"
      rowFieldKey="CashId"
      formUrl="trh/cash"
      addCaption={t("general.addNew")}
      caption={"title.cashList"}
      baseRepoId={3001}
      EditField="CashCode"
    />
  );
}
