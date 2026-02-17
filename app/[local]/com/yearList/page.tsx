import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IRequest, IYear } from "@services/com/year/type";

export default function YearListPage() {
  const t = useTranslations();

  return (
    <ViewList<IYear, IRequest>
      url="/api/com/select/year"
      deleteUrl="/api/com/delete/year"
      staticKey="YearDesc"
      rowFieldKey="YearId"
      formUrl="com/year"
      addCaption={t("general.addNew")}
      caption={"title.yearList"}
      baseRepoId={106066}
      pageIcon="FinancialYearIcon"
    />
  );
}
