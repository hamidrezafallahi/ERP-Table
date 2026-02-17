import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import { IRequest, IUser } from "@services/systemManagement/user/type";

export default function UserList() {
  const t = useTranslations();
  return (
    <ViewList<IUser, IRequest>
      url="/api/auth/select/user"
      deleteUrl="/api/auth/delete/user"
      rowFieldKey="UserId"
      formUrl="auth/user"
      staticKey="UserId"
      addCaption={t("title.addNew")}
      caption={"title.user"}
      baseRepoId={204008}
      pageIcon="UserIcon"
      EditField="Person.FullName"
    />
  );
}
