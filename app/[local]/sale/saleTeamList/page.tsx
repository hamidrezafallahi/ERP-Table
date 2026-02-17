import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IRequest, ISaleTeam } from "@services/sale/saleTeam/type";

export default function SaleTeamList() {
  const t = useTranslations();
  return (
    <ViewList<ISaleTeam, IRequest>
      url="/api/sale/select/saleTeam"
      deleteUrl="/api/sale/delete/saleTeam"
      staticKey="SaleTeamId"
      rowFieldKey="SaleTeamId"
      formUrl="sale/saleTeam"
      addCaption={t("general.addNew")}
      caption={"title.saleTeamList"}
      baseRepoId={1020}
      pageIcon="SaleTeamIcon"
      EditField="SaleTeamDesc"
    />
  );
}
