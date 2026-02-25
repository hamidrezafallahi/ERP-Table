import PriceAnnouncementTemplate from "@components/templates/priceAnnouncementTemplate";
import { IRequest } from "@services/reportFile/type";
import { IPriceAnnouncement } from "@services/sale/priceAnnouncement/type";

export default function PriceAnnouncementPage() {
  return (
    <PriceAnnouncementTemplate<IPriceAnnouncement, IRequest>
      fieldKey="PriceAnnouncementHeaderId"
      caption={"title.priceAnnouncement"}
      url="api/sale/select/saleQuotation"
      listUrl="sale/priceAnnouncementList"
      titleKey="PriceAnnouncement"
      pageIcon="IssuingProformaInvoiceIcon"
    />
  );
}
