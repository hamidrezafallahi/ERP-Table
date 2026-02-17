import PriceAnnouncementTemplate from "@components/templates/priceAnnouncementTemplate";
import { IInventoryVoucher } from "@services/inv/inventoryVoucher/type";
import { IRequest } from "@services/reportFile/type";

export default function PriceAnnouncementPage() {
  return (
    <PriceAnnouncementTemplate<IInventoryVoucher, IRequest>
      fieldKey="PriceAnnouncementHeaderId"
      caption={"title.priceAnnouncement"}
      url="api/inv/select/voucher"
      listUrl="inv/priceAnnouncementList"
      titleKey="PriceAnnouncement"
      // pageIcon="VoucherTypeIcon"
    />
  );
}
