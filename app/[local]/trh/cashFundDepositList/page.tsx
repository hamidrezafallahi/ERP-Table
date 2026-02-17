import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  ICashFundDeposit,
  IRequest,
} from "@services/trh/cashFundDeposit/type";

export default function CashFundDepositListPage() {
  const t = useTranslations();
  return (
    <ViewList<ICashFundDeposit, IRequest>
      url="api/trh/select/tankhahStatement/deposit"
      deleteUrl="api/trh/delete/tankhahStatement"
      staticKey="TankhahStatementId"
      rowFieldKey="TankhahStatementId"
      formUrl="trh/cashFundDeposit"
      addCaption={t("general.addNew")}
      caption={"title.cashFundDepositList"}
      baseRepoId={3016}
      pageIcon="CashFundDepositIcon"
    />
  );
}
