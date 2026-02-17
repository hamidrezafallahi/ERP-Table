import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IMarketingTeam,
  IRequest,
} from "@services/sale/marketingTeam/type";

export default function MarketingTeamList() {
  const t = useTranslations();
  return (
    <ViewList<IMarketingTeam, IRequest>
      url="/api/sale/select/marketingTeam"
      deleteUrl="/api/sale/delete/marketingTeam"
      staticKey="MarketingTeamId"
      rowFieldKey="MarketingTeamId"
      formUrl="sale/marketingTeam"
      addCaption={t("general.addNew")}
      caption={"title.marketingTeamList"}
      baseRepoId={1019}
      pageIcon="MarketingTeamIcon"
      EditField="MarketingTeamDesc"
    />
  );
}
