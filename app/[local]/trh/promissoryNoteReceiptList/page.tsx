import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import type {
  IChequeReceipt,
  IRequest,
} from '@services/trh/chequeReceipt/type';

export default function PromissoryNoteReceiptListPage() {
  const t = useTranslations();
  return (
    <ViewList<IChequeReceipt, IRequest>
      url="api/trh/select/check/ReceivePromissoryNote"
      deleteUrl="api/trh/delete/check/ReceivePromissoryNote"
      staticKey="VoucherNumber"
      staticKeyII="VoucherDate"
      rowFieldKey="CheckReceiptHeaderId"
      formUrl="trh/promissoryNoteReceipt"
      addCaption={t("general.addNew")}
      caption={"title.promissoryNoteReceiptList"}
      baseRepoId={3025}
      pageIcon="ChequeReceiptIcon"
      bodyKey={"PrommisoryType"}
    />
  );
}
