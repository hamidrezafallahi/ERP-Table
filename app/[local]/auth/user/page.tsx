import Form from "@components/templates/form";
import type { IRequest, IUser } from "@services/systemManagement/user/type";

export default function UserFormPage() {
  return (
    <Form<IUser, IRequest>
      caption={"title.user"}
      fieldKey="UserId"
      url="/api/auth/select/user"
      listUrl="auth/userList"
      titleKey="FullName"
      pageIcon="UserIcon"
    />
  );
}
