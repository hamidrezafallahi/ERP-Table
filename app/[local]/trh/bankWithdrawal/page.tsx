import Form from "@components/templates/form";
import type {
  IBankWithdrawal,
  IRequest,
} from "@services/trh/bankWithdrawal/type";

export default function BankWithdrawalFormPage() {
  return (
    <Form<IBankWithdrawal, IRequest>
      fieldKey="BankStatementId"
      caption={"title.bankWithdrawal"}
      url="api/trh/select/bankStatement/withdrawal"
      listUrl="trh/withdrawalList"
      titleKey="VoucherNumber"
      pageIcon="BankWithdrawalIcon"
    />
  );
}
