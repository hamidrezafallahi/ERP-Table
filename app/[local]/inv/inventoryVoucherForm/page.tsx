import InventoryVoucherTemplate
  from '@components/templates/inventoryVoucherTemplate';
import {
  IInventoryVoucher,
  IRequest,
} from '@services/inv/inventoryVoucher/type';

export default function InventoryVoucherFormPage() {
  return (
    // <Form<IInventoryVoucher, IRequest>
    //   fieldKey="VoucherHeaderId"
    //   caption={""}
    //   url="api/inv/select/voucher"
    //   listUrl="inv/inventoryVoucherList"
    //   titleKey="VoucherNumber"
    //   pageIcon="VoucherTypeIcon"
    // />
    // // <>
    <InventoryVoucherTemplate<IInventoryVoucher, IRequest>
      headerFieldKey="VoucherHeaderId"
      detailFieldKey='VoucherDetailId'
      caption={"title.inventoryVoucherForm"}
      captionII=''
      headerGetUrl="api/inv/select/voucher/header"
      detailGetUrl="api/inv/select/voucher/detail"
      addUrl = "api/inv/insert/voucher"
      updateUrl = "api/inv/update/voucher"
      listUrl="inv/inventoryVoucherList"
      titleKey="VoucherNumber"
      pageIcon="VoucherTypeIcon"
    />
    //   </>
  )
}
