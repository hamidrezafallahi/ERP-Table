import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IDiscountType, IRequest } from "@services/sale/discountType/type";

export default function DiscountTypeList() {
  const t = useTranslations();
  return (
    <ViewList<IDiscountType, IRequest>
      url="/api/com/select/discountTypeCommonInfo"
      deleteUrl="/api/com/delete/discountTypeCommonInfo"
      staticKey="CommonId"
      rowFieldKey="CommonId"
      formUrl="com/discountType"
      addCaption={t("general.addNew")}
      caption={"title.discountTypeList"}
      baseRepoId={106011}
      pageIcon="DiscountTypeIcon"
      EditField="CommonDesc"
    />
  );
}
