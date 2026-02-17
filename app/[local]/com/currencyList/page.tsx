import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { ICurrency, IRequest } from "@services/com/currency/type";

export default function CurrencyListPage() {
  const t = useTranslations();

  return (
    <ViewList<ICurrency, IRequest>
      url="/api/com/select/currency"
      deleteUrl="/api/com/delete/currency"
      staticKey="CurrencyDesc"
      rowFieldKey="CurrencyId"
      formUrl="com/currency"
      addCaption={t("general.addNew")}
      caption={"title.currencyList"}
      baseRepoId={106016}
      EditField="CurrencyCode"
    />
  );
}
