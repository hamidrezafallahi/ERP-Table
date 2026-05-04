import Form from '@components/templates/form';
import type {
  IRequest,
  IVoucher,
} from '@services/acc/voucher/type';

export default function VoucherFormPage() {
  return (<>
    <Form<IVoucher, IRequest>
        titleKey="VoucherHeaderId"
      fieldKey="VoucherHeaderId"
      caption={"title.voucher"}
      url="/api/acc/select/voucher"
      listUrl="acc/voucherList"
    />
    {/* <VoucherTemplate<IVoucher, IRequest>
          headerFieldKey="VoucherHeaderId"
          detailFieldKey='VoucherDetailId'
          caption={"title.VoucherForm"}
          captionII=''
          detailGetUrl="api/acc/select/voucherDetail"
          addUrl = "api/acc/insert/voucher"
          updateUrl = "api/acc/update/voucher"
          headerGetUrl="api/acc/select/voucher"
          tableTitle="اقلام سند"
          listUrl="acc/voucherList"
          titleKey="VoucherHeaderId"
          pageIcon="VoucherTypeIcon"
        /> */}
       </>

  );
}
