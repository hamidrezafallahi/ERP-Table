import { Form } from '@components/templates/form';
import type {
  IRequest,
  IReturnSalesInvoice,
} from '@services/sale/returnSalesInvoice/type';

export default function ReturnSalesInvoiceFormPage() {
  return (
    <Form<IReturnSalesInvoice, IRequest>
      fieldKey="SalesReturnHeaderId"
      caption={"title.returnSalesInvoice"}
      url="/api/sale/select/invoiceReturn"
      listUrl="sale/returnSalesInvoiceList"
      titleKey="VoucherNumber"
      pageIcon="SalesInvoiceList"
    />
  );
}
