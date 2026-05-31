import { Form } from '@components/templates/form';
import type {
  IBankAccount,
  IRequest,
} from '@services/com/bankAccount/type';

export default function BankAccountFormPage() {
  return (
    <Form<IBankAccount, IRequest>
      caption={"title.bankAccount"}
      fieldKey="BankAccountId"
      url="/api/com/select/bankAccount"
      listUrl="com/bankAccountList"
      titleKey={["AccountName" , "AccountNo"]}
        pageIcon="BankAccountIcon"
    />
  );
}
