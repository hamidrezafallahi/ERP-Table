import Form from "@components/templates/form";
import type {
  IRequest,
  IStandardSalesInvoice,
} from "@services/sale/standardSalesInvoice/type";

export default function StandardSalesInvoiceFormPage() {
  return (
    <Form<IStandardSalesInvoice, IRequest>
      fieldKey="InvoiceHeaderId"
      caption={"title.salesInvoice"}
      url="/api/sale/select/invoice"
      listUrl="sale/salesInvoiceList"
      titleKey="VoucherNumber"
      pageIcon="SalesInvoiceList"
    />
  );
}
