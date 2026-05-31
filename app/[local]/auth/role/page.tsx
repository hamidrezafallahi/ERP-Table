import { Form } from '@components/templates/form';
import type {
  IRequest,
  IRole,
} from '@services/systemManagement/role/type';

export default function UserFormPage() {
  return (
    <Form<IRole, IRequest>
      caption={"title.role"}
      fieldKey="RoleId"
      url="/api/auth/select/role"
      listUrl="auth/roleList"
      titleKey="RoleName"
      pageIcon="RoleIcon"
    />
  );
}
