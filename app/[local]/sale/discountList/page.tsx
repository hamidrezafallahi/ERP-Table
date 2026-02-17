import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IDiscount, IRequest } from "@services/sale/discount/type";

export default function DiscountList() {
  const t = useTranslations();
  return (
    <ViewList<IDiscount, IRequest>
      url="/api/sale/select/discount"
      deleteUrl="/api/sale/delete/discount"
      staticKey="DiscountId"
      rowFieldKey="DiscountId"
      formUrl="sale/discount"
      addCaption={t("general.addNew")}
      caption={"title.discountList"}
      baseRepoId={1046}
      pageIcon="DiscountIcon"
      EditField="DiscountCode"
    />
  );
}
