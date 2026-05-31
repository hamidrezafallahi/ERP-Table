import { Form } from '@components/templates/form';
import type {
  ICash,
  IRequest,
} from '@services/trh/cash/type';

export default function CashFormPage() {
  return (
    <Form<ICash, IRequest>
      fieldKey="CashId"
      caption={"title.cashForm"}
      url="/api/trh/select/cash"
      listUrl="trh/cashList"
      titleKey="CashDesc"
    />
  );
}
