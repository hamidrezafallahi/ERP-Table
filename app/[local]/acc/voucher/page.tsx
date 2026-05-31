import FormGenerator from '@components/organisms/formGenerator';
import VoucherTemplate from '@components/templates/voucherTemplate';
import type {
  IRequest,
  IVoucher,
} from '@services/acc/voucher/type';

export default function VoucherFormPage() {
  return (
    <>
      <FormGenerator<IVoucher, IRequest>
              caption={"title.VoucherForm"}
              detailGetUrl="api/acc/select/voucherDetail"
              fieldKey="asd"
              url="asd"
              addUrl="api/acc/insert/voucher"
              updateUrl="api/acc/update/voucher"
              headerGetUrl="api/acc/select/voucher"
              tableTitle="اقلام سند"
              listUrl="acc/voucherList"
              titleKey="VoucherNumber"
              detailFieldKey="VoucherDetailId"
              pageIcon="VoucherTypeIcon"
              Component={VoucherTemplate}
              fromIndexedDb
              headerFieldKey="VoucherHeaderId"
              saveAsDraft={true}
      />

      {/* <VoucherTemplate<IVoucher, IRequest>
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
