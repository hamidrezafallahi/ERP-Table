import { Form } from '@components/templates/form';
import type {
  ICashDeposit,
  IRequest,
} from '@services/trh/cashDeposit/type';

export default function CashDepositFormPage() {
  return (
    <Form<ICashDeposit, IRequest>
      fieldKey="CashStatementId"
      caption={"title.cashDeposit"}
      url="api/trh/select/cashStatement/deposit"
      listUrl="trh/cashDepositList"
      titleKey="VoucherNumber"
      pageIcon="CashDepositIcon"
    />
  );
}
