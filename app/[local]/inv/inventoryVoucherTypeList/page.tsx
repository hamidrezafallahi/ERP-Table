import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IInventoryVoucherType,
  IRequest,
} from "@services/inv/inventoryVoucherType/type";

export default function InventoryVoucherTypeList() {
  const t = useTranslations();
  return (
    <ViewList<IInventoryVoucherType, IRequest>
      url="/api/com/select/voucherType/inv"
      deleteUrl="/api/com/delete/voucherType"
      staticKey="VoucherTypeDesc"
      rowFieldKey="VoucherTypeId"
      formUrl="inv/inventoryVoucherType"
      addCaption={t("general.addNew")}
      caption={"title.inventoryVoucherTypeList"}
      baseRepoId={106065}
      pageIcon="VoucherTypeIcon"
      EditField="VoucherTypeDesc"
    />
  );
}
