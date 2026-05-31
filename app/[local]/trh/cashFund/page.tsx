import { Form } from '@components/templates/form';
import type {
  ICashFund,
  IRequest,
} from '@services/trh/cashFund/type';

export default function CashFundFormPage() {
  return (
    <Form<ICashFund, IRequest>
      fieldKey="CashId"
      caption={"title.cashFund"}
      url="/api/trh/select/tankhah"
      listUrl="trh/cashFundList"
      titleKey="CashDesc"
    />
  );
}
