import { Form } from '@components/templates/form';
import type {
  IBank,
  IRequest,
} from '@services/com/bank/type';

export default function BankFormPage({ isModal = false, parentPageId = null }) {
  return (
    <Form<IBank, IRequest>
      caption={"title.bank"}
      fieldKey="BankId"
      url="/api/com/select/bank"
      listUrl="com/bankList"
      titleKey="BankDesc"
      isModal={isModal}
      parentPageId={parentPageId}
    />
  );
}
