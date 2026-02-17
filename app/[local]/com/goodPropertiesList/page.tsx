import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IGoodProperty, IRequest } from "@services/com/goodProperty/type";

export default function GoodPropertiesListPage() {
  const t = useTranslations();
  return (
    <ViewList<IGoodProperty, IRequest>
      url="/api/com/select/goodsExtraInfo"
      deleteUrl="/api/com/delete/goodsExtraInfo"
      staticKey="GoodsExtraInfoDesc"
      rowFieldKey="GoodsExtraInfoId"
      formUrl="com/goodProperties"
      addCaption={t("general.addNew")}
      caption={"title.goodPropertiesList"}
      baseRepoId={106030}
      EditField="GoodsExtraInfoDesc"
    />
  );
}
