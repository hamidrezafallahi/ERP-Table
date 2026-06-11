import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import type {
  IChequeReceipt,
  IRequest,
} from '@services/trh/chequeReceipt/type';

export default function ChequeDeployListPage() {
  const t = useTranslations();
  return (
    <ViewList<IChequeReceipt, IRequest>
      url="api/trh/select/check/DeployCheck"
      deleteUrl="api/trh/delete/check/DeployCheck"
      staticKey="VoucherNumber"
      staticKeyII="VoucherDate"
      rowFieldKey="CheckReceiptHeaderId"
      formUrl="trh/chequeDeploy"
      addCaption={t("general.addNew")}
      caption={"title.chequeDeployList"}
      baseRepoId={3025}
      pageIcon="ChequeReceiptIcon"
      bodyKey={"PrommisoryType"}
    />
  );
}
