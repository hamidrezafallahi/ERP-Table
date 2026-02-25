import InvoiceTemplate from "@components/templates/invoiceTemplate";
import { IRequest } from "@services/reportFile/type";
import { IInvoice } from "@services/sale/invoice/type";

export default function InvoicePage() {
  return (
    <InvoiceTemplate<IInvoice, IRequest>
      fieldKey="InvoiceHeaderId"
      caption={"title.invoice"}
      url="api/sale/select/ProformaInvoice"
      listUrl="sale/invoiceList"
      titleKey="invoice"
      pageIcon="IssuingProformaInvoiceIcon"
    />
  );
}
