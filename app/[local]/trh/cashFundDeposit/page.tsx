import Form from "@components/templates/form";
import type {
  ICashFundDeposit,
  IRequest,
} from "@services/trh/cashFundDeposit/type";

export default function CashFundDepositFormPage() {
  return (
    <Form<ICashFundDeposit, IRequest>
      fieldKey="TankhahStatementId"
      caption={"title.cashFundDeposit"}
      url="api/trh/select/tankhahStatement/deposit"
      listUrl="trh/cashFundDepositList"
      titleKey="VoucherNumber"
      pageIcon="CashFundDepositIcon"
    />
  );
}
