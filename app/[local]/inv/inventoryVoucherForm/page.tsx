import { MasterForm } from '@components/templates/form';
import InventoryVoucherTemplate
  from '@components/templates/inventoryVoucherTemplate';
import {
  IInventoryVoucher,
  IRequest,
} from '@services/inv/inventoryVoucher/type';

export default function InventoryVoucherFormPage() {
  return (
    <MasterForm<IInventoryVoucher, IRequest>
      listUrl="inv/inventoryVoucherList"
      captionII=''
      pageIcon="VoucherTypeIcon"
      Component={InventoryVoucherTemplate}
      headerFieldKey="VoucherHeaderId"
      detailFieldKey="VoucherDetailId"
      caption={"title.inventoryVoucherForm"}
      headerGetUrl="api/inv/select/voucher/header"
      detailGetUrl="api/inv/select/voucher/detail"
      addUrl="api/inv/insert/voucher"
      updateUrl="api/inv/update/voucher"
      saveAsDraft={true}
      DefaultHeaderRepoViewId={10011}
      DefaultDetailRepoViewId={70003}
      tableTitle= "اقلام سند"
      storeName='Voucher'
    />
 
  );
}
