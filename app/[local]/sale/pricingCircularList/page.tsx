import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IPricingCircular,
  IRequest,
} from "@services/sale/pricingCircular/type";

export default function PricingCircularList() {
  const t = useTranslations();
  return (
    <ViewList<IPricingCircular, IRequest>
      url="/api/sale/select/priceOrder"
      deleteUrl="/api/sale/delete/priceOrder"
      staticKey="PriceOrderDesc"
      rowFieldKey="PriceOrderHeaderId"
      formUrl="sale/pricingCircular"
      addCaption={t("general.addNew")}
      caption={"title.pricingCircularList"}
      baseRepoId={1062}
      pageIcon="DiscountIcon"
      EditField="PriceOrderDesc"
    />
  );
}
