import { Form } from '@components/templates/form';
import type {
  IAccess,
  IRequest,
} from '@services/systemManagement/access/type';

export default function UserFormPage() {
  return (
    <Form<IAccess, IRequest>
      caption={"title.access"}
      fieldKey=""
      url=""
      listUrl=""
      titleKey=""
      pageIcon="AccessIcon"
    />
  );
}
