import { useTranslations } from "next-intl";

import { ActionLabelsEnum } from "@components/organisms/list/enum";
import ViewList from "@components/templates/viewList";
import type { IGood, IRequest } from "@services/com/good/type";

export default function GoodsListPage() {
  const t = useTranslations();
  return (
    <ViewList<IGood, IRequest>
      url="/api/com/select/goods"
      deleteUrl="/api/com/delete/goods"
      staticKey="GoodsDesc"
      rowFieldKey="GoodsId"
      formUrl="com/good"
      addCaption={t("general.addNew")}
      caption={"title.goodList"}
      baseRepoId={106023}
      EditField="GoodsCode"
      pageIcon="GoodsIcon"
      conditionalActions={[
        {
          conditionalProperty: "HasVariant",
          conditionallyAction: ActionLabelsEnum.GoodVariantValues as string,
        },
        {
          conditionalProperty: "HasInputQuality",
          conditionallyAction: ActionLabelsEnum.GoodQc as string,
        },
        {
          conditionalProperty: "IsService",
          conditionallyAction: ActionLabelsEnum.InventoryControl as string,
          opposite: true,
        },
        {
          conditionalProperty: "IsService",
          conditionallyAction: ActionLabelsEnum.GoodMeasurementUnit as string,
          opposite: true,
        },
      ]}
    />
  );
}
