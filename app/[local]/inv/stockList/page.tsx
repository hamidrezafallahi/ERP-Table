import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IRequest, IStock } from "@services/inv/stock/type";

export default function StockList() {
  const t = useTranslations();

  return (
    <ViewList<IStock, IRequest>
      url="/api/inv/select/stock"
      deleteUrl="/api/inv/delete/stock"
      staticKey="StockId"
      rowFieldKey="StockId"
      formUrl="inv/stock"
      addCaption={t("general.addNew")}
      caption={"title.stockList"}
      baseRepoId={2001}
      pageIcon="StockIcon"
      EditField="StockDesc"
    />
  );
}
