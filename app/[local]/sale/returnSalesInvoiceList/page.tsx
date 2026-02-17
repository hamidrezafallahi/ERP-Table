import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IRequest,
  IReturnSalesInvoice,
} from "@services/sale/returnSalesInvoice/type";

export default function ReturnSalesInvoiceList() {
  const t = useTranslations();
  return (
    <ViewList<IReturnSalesInvoice, IRequest>
      url="/api/sale/select/invoiceReturn"
      deleteUrl="/api/sale/delete/invoiceReturn"
      staticKey="VoucherNumber"
      staticKeyII="VoucherDate"
      rowFieldKey="SalesReturnHeaderId"
      formUrl="sale/returnSalesInvoice"
      addCaption={t("general.addNew")}
      caption={"title.returnSalesInvoiceList"}
      baseRepoId={1015}
      pageIcon="SalesInvoiceIcon"
    />
  );
}
