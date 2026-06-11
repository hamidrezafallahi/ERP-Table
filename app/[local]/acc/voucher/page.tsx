import { MasterForm } from '@components/templates/form';
import VoucherTemplate from '@components/templates/voucherTemplate';
import type {
  IRequest,
  IVoucher,
} from '@services/acc/voucher/type';

export default function VoucherFormPage() {
  return (
    <MasterForm<IVoucher, IRequest>
      caption={"title.VoucherForm"}
      captionII=''
      detailGetUrl="api/acc/select/voucherDetail"
      addUrl="api/acc/insert/voucher"
      updateUrl="api/acc/update/voucher"
      headerGetUrl="api/acc/select/voucher"
      tableTitle="اقلام سند"
      listUrl="acc/voucherList"
      detailFieldKey="VoucherDetailId"
      pageIcon="VoucherTypeIcon"
      Component={VoucherTemplate}
      headerFieldKey="VoucherHeaderId"
      saveAsDraft={true}
      DefaultHeaderRepoViewId={10011}
      DefaultDetailRepoViewId={70003}
      storeName="Voucher"
      
    />
  );
}
