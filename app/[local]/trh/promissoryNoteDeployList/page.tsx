import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import type {
  IChequeReceipt,
  IRequest,
} from '@services/trh/chequeReceipt/type';

export default function PromissoryNoteDeployListPage() {
  const t = useTranslations();
  return (
    <ViewList<IChequeReceipt, IRequest>
      url=""
      deleteUrl="api/trh/delete/check/DeployPromissoryNote"
      staticKey="VoucherNumber"
      staticKeyII="VoucherDate"
      rowFieldKey="CheckReceiptHeaderId"
      formUrl="trh/promissoryNoteDeploy"
      addCaption={t("general.addNew")}
      caption={"title.promissoryNoteDeployList"}
      baseRepoId={3025}
      pageIcon="ChequeReceiptIcon"
      bodyKey={"PrommisoryType"}
    />
  );
}
