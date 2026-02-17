import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  ICashFundWithdrawal,
  IRequest,
} from "@services/trh/cashFundWithdrawal/type";

export default function CashFundWithdrawalListPage() {
  const t = useTranslations();
  return (
    <ViewList<ICashFundWithdrawal, IRequest>
      url="api/trh/select/tankhahStatement/withdrawal"
      deleteUrl="api/trh/delete/tankhahStatement"
      staticKey="TankhahStatementId"
      rowFieldKey="TankhahStatementId"
      formUrl="trh/cashFundWithdrawal"
      addCaption={t("general.addNew")}
      caption={"title.cashFundWithdrawalList"}
      baseRepoId={3017}
      pageIcon="CashFundWithdrawalIcon"
      EditField="CashCode"
    />
  );
}
