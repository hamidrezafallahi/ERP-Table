import Form from "@components/templates/form";
import type {
  IMarketingTeam,
  IRequest,
} from "@services/sale/marketingTeam/type";

export default function MarketingTeamFormPage() {
  return (
    <Form<IMarketingTeam, IRequest>
      fieldKey="MarketingTeamId"
      caption={"title.marketingTeam"}
      url="/api/sale/select/marketingTeam"
      listUrl="sale/marketingTeamList"
      titleKey="MarketingTeamDesc"
      pageIcon="MarketingTeamIcon"
    />
  );
}
