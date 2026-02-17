import Form from "@components/templates/form";
import type {
  ICashFundWithdrawal,
  IRequest,
} from "@services/trh/cashFundWithdrawal/type";

export default function CashFundWithdrawalFormPage() {
  return (
    <Form<ICashFundWithdrawal, IRequest>
      fieldKey="TankhahStatementId"
      caption={"title.cashFundWithdrawal"}
      url="api/trh/select/tankhahStatement/withdrawal"
      listUrl="trh/cashFundWithdrawalList"
      titleKey="VoucherNumber"
      pageIcon="CashFundWithdrawalIcon"
    />
  );
}
