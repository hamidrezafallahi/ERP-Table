import { Form } from '@components/templates/form';
import type {
  IPaymentMethod,
  IRequest,
} from '@services/sale/paymentMethod/type';

export default function PaymentMethodFormPage() {
  return (
    <Form<IPaymentMethod, IRequest>
      caption={"title.paymentMethod"}
      fieldKey="PaymentWayId"
      url="/api/sale/select/paymentWay"
      listUrl="sale/paymentMethodList"
      titleKey="PaymentWayDesc"
      pageIcon="PaymentMethodIcon"
    />
  );
}
