import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import { IRequest, IRole } from "@services/systemManagement/role/type";

export default function RoleList() {
  const t = useTranslations();
  return (
    <ViewList<IRole, IRequest>
      url="/api/auth/select/role"
      deleteUrl="/api/auth/delete/role"
      rowFieldKey="RoleId"
      staticKey="RoleDesc"
      formUrl="auth/role"
      addCaption={t("title.addNew")}
      caption={"title.role"}
      baseRepoId={204005}
      pageIcon="RoleIcon"
      EditField="RoleName"
    />
  );
}
