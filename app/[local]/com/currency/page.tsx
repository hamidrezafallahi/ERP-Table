import Form from "@components/templates/form";
import type { ICurrency, IRequest } from "@services/com/currency/type";

export default function CurrencyFormPage() {
  return (
    <Form<ICurrency, IRequest>
      caption={"title.currency"}
      fieldKey="CurrencyId"
      url="/api/com/select/currency"
      listUrl="com/currencyList"
      titleKey="CurrencyDesc"
    />
  );
}
