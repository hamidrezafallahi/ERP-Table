import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { ICurrencyRate, IRequest } from "@services/com/currencyRate/type";

export default function CurrencyRateListPage() {
  const t = useTranslations();

  return (
    <ViewList<ICurrencyRate, IRequest>
      url="/api/com/select/currencyRate"
      deleteUrl="/api/com/delete/currencyRate"
      staticKey="CurrencyRateId"
      rowFieldKey="CurrencyRateId"
      formUrl="com/currencyRate"
      addCaption={t("general.addNew")}
      caption={"title.currencyRateList"}
      baseRepoId={106070}
      EditField="CurrencyRateId"
      pageIcon="CurrencyRateIcon"
    />
  );
}
