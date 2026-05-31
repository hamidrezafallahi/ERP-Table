import { Form } from '@components/templates/form';
import {
  IMachin,
  IRequest,
} from '@services/prd/machin/type';

export default function MachinFormPage() {
  return (
    <Form<IMachin, IRequest>
      caption={"title.machin"}
      fieldKey="MachinId"
      url="/api/prd/select/machin"
      listUrl="prd/machinList"
      titleKey="MachinDesc"
      pageIcon="MachinIcon"
    />
  );
}
