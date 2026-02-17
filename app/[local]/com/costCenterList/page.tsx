import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { ICostCenter, IRequest } from "@services/com/costCenter/type";

export default function CostCenterListPage() {
  const t = useTranslations();

  return (
    <ViewList<ICostCenter, IRequest>
      url="/api/com/select/costCenter"
      deleteUrl="/api/com/delete/costCenter"
      staticKey="CostCenterDesc"
      rowFieldKey="CostCenterId"
      formUrl="com/costCenter"
      addCaption={t("general.addNew")}
      caption={"title.costCenterList"}
      baseRepoId={106015}
      EditField="CostCenterDesc"
      pageIcon="DollarSignIcon"
    />
  );
}
