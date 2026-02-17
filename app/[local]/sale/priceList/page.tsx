import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IPrice, IRequest } from "@services/sale/price/type";

export default function PriceList() {
  const t = useTranslations();
  return (
    <ViewList<IPrice, IRequest>
      url="api/sale/select/PriceListHeader"
      deleteUrl="api/sale/delete/PriceListHeader"
      staticKey="PriceListHeaderId"
      rowFieldKey="PriceListHeaderId"
      formUrl="sale/price"
      addCaption={t("general.addNew")}
      caption={"title.priceList"}
      baseRepoId={1011}
      pageIcon="PriceList"
      EditField="PriceListHeaderDesc"
    />
  );
}
