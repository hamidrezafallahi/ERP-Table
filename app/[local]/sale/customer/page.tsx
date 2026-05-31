import { Form } from '@components/templates/form';
import type {
  ICustomer,
  IRequest,
} from '@services/sale/customer/type';

export default function CustomerFormPage() {
  return (
    <Form<ICustomer, IRequest>
      fieldKey="CustomerId"
      caption={"title.customer"}
      url="/api/sale/select/customer"
      listUrl="sale/customerList"
      titleKey={["FullName","CustomerCode"]}
      pageIcon="SaleListIcon"
    />
  );
}
