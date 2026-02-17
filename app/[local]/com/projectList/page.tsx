import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IProject, IRequest } from "@services/com/project/type";

export default function ProjectListPage() {
  const t = useTranslations();

  return (
    <ViewList<IProject, IRequest>
      url="/api/com/select/project"
      deleteUrl="/api/com/delete/project"
      staticKey="ProjectDesc"
      rowFieldKey="ProjectId"
      formUrl="com/project"
      addCaption={t("general.addNew")}
      caption={"title.projectList"}
      baseRepoId={106051}
      EditField="ProjectCode"
      pageIcon="ProjectIcon"
    />
  );
}
