import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import { IRequest, ITax } from "@services/com/tax/type";

export default function TaxListPage() {
  const t = useTranslations();
  return (
    <ViewList<ITax, IRequest>
      url="/api/com/select/tax"
      deleteUrl="/api/com/delete/tax"
      staticKey="TaxDesc"
      rowFieldKey="TaxId"
      formUrl="com/tax"
      addCaption={t("title.addNew")}
      caption={"title.tax"}
      baseRepoId={106059}
      pageIcon="TaxIcon"
      EditField="TaxDesc"
    />
  );
}
