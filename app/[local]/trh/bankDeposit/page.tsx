import { Form } from '@components/templates/form';
import type {
  IBankDeposit,
  IRequest,
} from '@services/trh/bankDeposit/type';

export default function BankDepositFormPage() {
  return (
    <Form<IBankDeposit, IRequest>
      fieldKey="BankStatementId"
      caption={"title.bankDeposit"}
      url="api/trh/select/bankStatement/deposit"
      listUrl="trh/bankDepositList"
      titleKey="VoucherNumber"
      pageIcon="BankDepositIcon"
    />
  );
}
