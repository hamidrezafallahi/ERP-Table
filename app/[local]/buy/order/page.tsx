import { Form } from '@components/templates/form';
import type {
  IBuyRequest,
  IRequest,
} from '@services/buy/buyRequest/type';

export default function OrderFormPage() {
  return (
    <Form<IBuyRequest, IRequest>
      fieldKey="InvoiceHeaderId"
      caption={"title.order"}
      url="/api/buy/select/buyRequest"
      listUrl="buy/orderList"
      titleKey="DocId"
      pageIcon="PurchaseRequestIcon"
    />
  );
}
