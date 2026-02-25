import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";

import type  { IPriceAnnouncement, IRequest } from "@services/sale/priceAnnouncement/type";

export default function PriceAnnouncementListPage() {
  const t = useTranslations();
  return (
    <ViewList<IPriceAnnouncement, IRequest>
      url="api/sale/select/saleQuotation"
      deleteUrl="api/sale/delete/saleQuotation"
      staticKey="VoucherNumber"
      staticKeyII="VoucherDate"
      rowFieldKey="PreInvoiceHeaderId"
      formUrl="sale/priceAnnouncement"
      addCaption={t("general.addNew")}
      caption={"title.priceAnnouncementList"}
      baseRepoId={1084}
      pageIcon="IssuingProformaInvoiceIcon"
    />
  );
}
