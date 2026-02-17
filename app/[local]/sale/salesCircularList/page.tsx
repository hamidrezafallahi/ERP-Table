import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IRequest,
  ISalesCircular,
} from "@services/sale/salesCircular/type";

export default function SalesCircularList() {
  const t = useTranslations();
  return (
    <ViewList<ISalesCircular, IRequest>
      url="/api/sale/select/saleRule"
      deleteUrl="/api/sale/delete/saleRule"
      staticKey="SaleRuleNumber"
      rowFieldKey="SaleRuleId"
      formUrl="sale/salesCircular"
      addCaption={t("general.addNew")}
      caption={"title.salesCircularList"}
      baseRepoId={1064}
      pageIcon="DiscountIcon"
      EditField="DiscountCode"
    />
  );
}
