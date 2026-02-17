import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IReport, IRequest } from "@services/mng/report/type";

export default function ReportListPage() {
  const t = useTranslations();

  return (
    <ViewList<IReport, IRequest>
      url="/api/report/select/reports"
      deleteUrl="/api/report/delete/reports"
      staticKey="Title"
      rowFieldKey="ReportId"
      formUrl="report/reportForm"
      addCaption={t("general.addNew")}
      caption={"title.reportList"}
      baseRepoId={10001}
      pageIcon="ReportIcon"
      EditField="Title"
    />
  );
}
