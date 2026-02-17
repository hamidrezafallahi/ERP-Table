import Form from "@components/templates/form";
import type { IReport, IRequest } from "@services/mng/report/type";

export default function ReportFormPage() {
  return (
    <Form<IReport, IRequest>
      caption={"title.reportForm"}
      fieldKey="ReportId"
      url="/api/report/select/reports"
      listUrl="report/reportList"
      titleKey="Title"
    />
  );
}
