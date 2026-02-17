import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import { IRequest, IYearPlan } from "@services/prd/yearPlan/type";

export default function YearPlanListPage() {
  const t = useTranslations();

  return (
    <ViewList<IYearPlan, IRequest>
      url="/api/prd/select/yearPlan/latestVersion"
      deleteUrl="/api/prd/delete/yearPlan"
      staticKey="YearPlanId"
      rowFieldKey="YearPlanId"
      formUrl="prd/yearPlan"
      addCaption={t("general.registerANewProgram")}
      caption={"title.yearPlanList"}
      baseRepoId={8012}
      pageIcon="AnnualProgramIcon"
      EditField="FullName"
    
    />
  );
}
