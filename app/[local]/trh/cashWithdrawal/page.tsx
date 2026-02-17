import Form from "@components/templates/form";
import type {
  ICashWithdrawal,
  IRequest,
} from "@services/trh/cashWithdrawal/type";

export default function CashWithdrawalFormPage() {
  return (
    <Form<ICashWithdrawal, IRequest>
      fieldKey="CashWithdrawalDesc"
      caption={"title.cashWithdrawal"}
      url="api/trh/select/cashStatement/withdrawal"
      listUrl="trh/cashWithdrawalList"
      titleKey="VoucherNumber"
      pageIcon="CashWithdrawalIcon"
    />
  );
}
