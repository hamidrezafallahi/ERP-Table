import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IRequest, IVariant } from "@services/com/variant/type";

export default function GoodVariantsListPage() {
  const t = useTranslations();
  return (
    <ViewList<IVariant, IRequest>
      url="/api/com/select/variant"
      deleteUrl="/api/com/delete/variant"
      staticKey="VariantDesc"
      rowFieldKey="VariantId"
      additionalFieldKey="CommonTypeId"
      formUrl="com/goodVariant"
      addCaption={t("general.addNew")}
      caption={"title.goodVariantList"}
      baseRepoId={106062}
      EditField="Title"
      pageIcon="VariantIcon"
    />
  );
}
