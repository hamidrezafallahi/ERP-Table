import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import type {
  IChequeIssuance,
  IRequest,
} from '@services/trh/chequeIssuance/type';

export default function ChequeIssuanceListPage() {
  const t = useTranslations();
  return (
    <ViewList<IChequeIssuance, IRequest>
      url="api/trh/select/check/IssuePromissoryNote"
      deleteUrl="api/trh/delete/check/IssuePromissoryNote"
      staticKey="VoucherNumber"
      staticKeyII="VoucherDate"
      rowFieldKey="CheckIssuanceHeaderId"
      formUrl="trh/promissoryNoteIssuance"
      addCaption={t("general.addNew")}
      caption={"title.promissoryNoteIssuanceList"}
      baseRepoId={3023}
      pageIcon="ChequeIssuanceIcon"
      bodyKey={"PrommisoryType"}
    />
  );
}
