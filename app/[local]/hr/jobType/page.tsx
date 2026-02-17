import Form from "@components/templates/form";
import { IJobType, IRequest } from "@services/hr/jobType/type";

export default function JobTypeFormPage() {
  return (
    <Form<IJobType, IRequest>
      fieldKey="JobTypeId"
      caption={"title.jobTypeForm"}
      url="/api/hr/select/jobType"
      listUrl="hr/jobTypeList"
      titleKey="JobTypeDesc"
      pageIcon="JobTypeIcon"
    />
  );
}
