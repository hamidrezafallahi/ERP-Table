import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import type {
  IInventoryVoucher,
  IRequest,
} from '@services/inv/inventoryVoucher/type';

export default function InventoryVoucherListPage() {
  const t = useTranslations();
  return (
    <ViewList<IInventoryVoucher, IRequest>
      url="api/inv/select/voucher"
      deleteUrl="api/inv/delete/voucher"
      staticKey="VoucherNumber"
      rowFieldKey="VoucherHeaderId"
      formUrl="inv/inventoryVoucherForm"
      addCaption={t("general.addNew")}
      caption={"title.inventoryVoucherList"}
      baseRepoId={2002}
      pageIcon="VoucherTypeIcon"
      bodyKey="VoucherTypeId"
    />
  );
}
