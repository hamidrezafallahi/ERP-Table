import { useTranslations } from "next-intl";
import ViewList from "@components/templates/viewList";
import { IJobType, IRequest } from "@services/hr/jobType/type";

export default function JobTypeList() {
  const t = useTranslations();

  return (
    <ViewList<IJobType, IRequest>
      url="/api/hr/select/jobType"
      deleteUrl="/api/hr/delete/jobType"
      staticKey="JobTypeId"
      rowFieldKey="JobTypeId"
      baseRepoId={9020}
      formUrl="hr/jobType"
      addCaption={t("general.addNew")}
      caption={"title.jobTypeList"}
      pageIcon="JobTypeIcon"
      EditField="JobTypeDesc"
    />
  );
}
